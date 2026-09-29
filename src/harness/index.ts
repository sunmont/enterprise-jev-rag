import { GeminiEmbeddingProvider, LocalMockEmbeddingProvider } from "../services/embedding";
import { VectorStoreManager } from "../services/vectorStore";
import { geminiAgent } from "../lib/geminiAgent";
import { createVectorTools } from "../tools/vectorTools";
import { dshWebSearchTool } from "../tools/webTools";
import { DeepSeekHarness, DSHContext } from "./dsh";
import { runRouterHook } from "./hooks/routerHook";
import { runGraderHook } from "./hooks/graderHook";
import { runGuardrailHook } from "./hooks/guardrailHook";
import { CONFIG } from "../config";

export class RAGPipelineHarness {
  public vectorStore: VectorStoreManager;
  public dsh: DeepSeekHarness;

  constructor() {
    const embeddingProvider = CONFIG.geminiApiKey
      ? new GeminiEmbeddingProvider(CONFIG.geminiApiKey, CONFIG.geminiEmbeddingModel)
      : new LocalMockEmbeddingProvider(384);

    this.vectorStore = new VectorStoreManager(embeddingProvider);
    this.dsh = new DeepSeekHarness();

    const vectorTools = createVectorTools(this.vectorStore);
    this.dsh.registerTools([...vectorTools, dshWebSearchTool]);
  }

  public async executeQuery(query: string): Promise<string> {
    const ctx: DSHContext = { userQuery: query, metadata: {} };

    console.log(`\n[DSH Web Pipeline] Processing: "${query}"`);

    // 1. System 1 Router via Jev Hook
    ctx.route = await runRouterHook(query);

    let rawSearchResults: string;

    // 2. Execute via DSH Web or Local Vector Store based on Route
    if (ctx.route === "web_search") {
      console.log("[Pipeline] Dispatching to DSH Web Search...");
      rawSearchResults = await this.dsh.executeTool("web_search", { query });
    } else {
      console.log("[Pipeline] Dispatching to Local Vector Store...");
      rawSearchResults = await this.dsh.executeTool("vector_search", { query, topK: 5 });
    }

    const parsedResults = JSON.parse(rawSearchResults);
    const searchResults = parsedResults.map((item: any) => ({
      record: { chunk: { text: item.text } },
    }));

    // 3. System 1 Relevance Grader
    ctx.verifiedChunks = await runGraderHook(query, searchResults);
    if (ctx.verifiedChunks.length === 0) {
      return "NOTICE: No sufficiently relevant source documents were found.";
    }

    // 4. System 2 Response Synthesis via Gemini
    console.log("[Gemini Synthesis] Generating final response...");
    ctx.proposedAnswer = await geminiAgent.generateResponse(query, ctx.verifiedChunks);

    // 5. System 1 Guardrail Verification
    const passesGuardrail = await runGuardrailHook(ctx.proposedAnswer, ctx.verifiedChunks);
    if (!passesGuardrail) {
      throw new Error("DSH Guardrail Triggered: Proposed answer contains unverified claims.");
    }

    return ctx.proposedAnswer;
  }
}