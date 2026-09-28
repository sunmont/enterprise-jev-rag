import { DeepSeekHarness } from "@deepseek-ai/dsh";
import { jev } from "../../lib/jevClient";
import { CONFIG } from "../../config";

export function applyGuardrailHook(harness: DeepSeekHarness): void {
  harness.on("before_response", async (ctx) => {
    if (ctx.metadata.route === "vector_search") {
      try {
        const judgment = await jev.noul({
          state: `Provided RAG Context:\n${ctx.toolOutputs}\n\nProposed Agent Answer:\n${ctx.proposedResponse}`,
          question: "Is every factual claim in the proposed answer strictly supported by the provided context?",
        });

        console.log(`[Jev Guardrail] Faithfulness Probability: ${(judgment.probability * 100).toFixed(1)}%`);

        if (judgment.probability < CONFIG.FAITHFULNESS_THRESHOLD) {
          console.warn("[Jev Guardrail Blocked] Proposed response failed faithfulness check.");
          ctx.rejectResponse(
            "Safety Error: Response contained unverified claims not found in the source documents. Please re-synthesize strictly using the provided context."
          );
        }
      } catch (error) {
        console.error("[Jev Guardrail Error] Verification failed. Halting closed for safety.", error);
        ctx.rejectResponse("Execution halted due to safety verification error.");
      }
    }
  });
}