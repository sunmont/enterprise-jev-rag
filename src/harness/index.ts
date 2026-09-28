import { DeepSeekHarness } from "@deepseek-ai/dsh";
import { piAgent } from "../lib/piAgent";
import { VectorStoreManager } from "../services/vectorStore";
import { LocalMockEmbeddingProvider, OpenAIEmbeddingProvider } from "../services/embedding";
import { createVectorTools } from "../tools/vectorTools";
import { applyRouterHook } from "./hooks/routerHook";
import { applyGraderHook } from "./hooks/graderHook";
import { applyGuardrailHook } from "./hooks/guardrailHook";
import { CONFIG } from "../config";

export function createHarness(): { harness: DeepSeekHarness; vectorStore: VectorStoreManager } {
  // Choose embedding provider based on environment variables
  const provider = CONFIG.OPENAI_API_KEY
    ? new OpenAIEmbeddingProvider(CONFIG.OPENAI_API_KEY)
    : new LocalMockEmbeddingProvider(384);

  const vectorStore = new VectorStoreManager(provider);
  const tools = createVectorTools(vectorStore);

  const harness = new DeepSeekHarness({
    agent: piAgent,
    maxSteps: 5,
    sandbox: { enabled: true, mode: "read_only" },
  });

  // Register vector tools
  tools.forEach((t) => harness.registerTool(t));

  // Apply Jev System-1 lifecycle interceptors
  applyRouterHook(harness);
  applyGraderHook(harness);
  applyGuardrailHook(harness);

  return { harness, vectorStore };
}