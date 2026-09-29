import { jev } from "../../lib/jevClient";
import { CONFIG } from "../../config";

export async function runGuardrailHook(proposedAnswer: string, contextBlocks: string[]): Promise<boolean> {
  try {
    const judgment = await jev.noul({
      state: `Provided RAG Context:\n${contextBlocks.join("\n\n")}\n\nProposed Agent Answer:\n${proposedAnswer}`,
      question: "Is every factual claim in the proposed answer strictly supported by the provided context?",
    });

    console.log(`[Jev Guardrail] Faithfulness Probability: ${(judgment.probability * 100).toFixed(1)}%`);

    return judgment.probability >= CONFIG.faithfulnessThreshold;
  } catch (error) {
    console.error("[Jev Guardrail Error] Safety verification check failed.", error);
    return false;
  }
}