import { DeepSeekHarness } from "@deepseek-ai/dsh";
import { jev } from "../../lib/jevClient";

export function applyRouterHook(harness: DeepSeekHarness): void {
  harness.on("before_turn", async (ctx) => {
    try {
      const routing = await jev.choice({
        state: `User Request: ${ctx.userPrompt}`,
        options: [
          {
            name: "vector_search",
            description:
              "Use when the user asks about internal strategy, company policies, technical specs, or proprietary protocols. Do NOT use for general trivia or greetings.",
          },
          {
            name: "web_search",
            description:
              "Use when the user explicitly asks about real-time external market events, public news, or post-2024 global facts.",
          },
          {
            name: "direct_answer",
            description:
              "Use ONLY when the user prompt is a greeting, pleasantry, or formatting request requiring no external facts.",
          },
        ],
      });

      ctx.enableTools([routing.selection]);
      ctx.metadata.route = routing.selection;
      console.log(`[Jev Router] Selected Route: '${routing.selection}' (Confidence: ${(routing.confidence * 100).toFixed(1)}%)`);
    } catch (error) {
      console.warn("[Jev Router Warning] Jev service unavailable. Failing open to all tools.", error);
      ctx.enableTools(["vector_search", "ingest_document", "manage_vector_store", "direct_answer"]);
    }
  });
}