import { DeepSeekHarness } from "@deepseek-ai/dsh";
import { jev } from "../../lib/jevClient";
import { CONFIG } from "../../config";

export function applyGraderHook(harness: DeepSeekHarness): void {
  harness.on("tool_result", async (event) => {
    if (event.toolName !== "vector_search") return;

    try {
      const rawChunks = JSON.parse(event.rawOutput);
      const validatedChunks: string[] = [];

      const gradingPromises = rawChunks.map(async (chunk: { text: string }) => {
        const judgment = await jev.score({
          state: `User Query: ${event.originalPrompt}\nRetrieved Chunk: ${chunk.text}`,
          rubric: [
            "Level 0: Unrelated noise or generic stop-word overlap.",
            "Level 1: Mentions entities in the query, but lacks specific metrics or factual steps.",
            "Level 2: Contains the explicit facts, metrics, or instructions needed to answer the query.",
          ],
        });

        return {
          text: chunk.text,
          level: judgment.level,
          confidence: judgment.confidence,
        };
      });

      const results = await Promise.all(gradingPromises);

      results.forEach((res) => {
        if (res.level === 2 && res.confidence >= CONFIG.GRADER_CONFIDENCE_THRESHOLD) {
          validatedChunks.push(res.text);
        }
      });

      console.log(`[Jev Grader] Kept ${validatedChunks.length} of ${rawChunks.length} retrieved chunks.`);

      event.overrideOutput(
        validatedChunks.length > 0
          ? validatedChunks.join("\n\n---\n\n")
          : "NOTICE: Internal search returned no highly relevant documents. Tell the user you lack sufficient context."
      );
    } catch (err) {
      console.error("[Jev Grader Error] Failed to parse/grade tool results:", err);
    }
  });
}