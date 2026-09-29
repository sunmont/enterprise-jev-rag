import { jev } from "../../lib/jevClient";
import { CONFIG } from "../../config";
import { SearchResult } from "../../types";

export async function runGraderHook(query: string, searchResults: SearchResult[]): Promise<string[]> {
  if (searchResults.length === 0) return [];

  const validatedChunks: string[] = [];

  const gradingPromises = searchResults.map(async (res) => {
    const chunkText = res.record.chunk.text;
    const judgment = await jev.score({
      state: `User Query: ${query}\nRetrieved Chunk: ${chunkText}`,
      rubric: [
        "Level 0: Unrelated noise or generic stop-word overlap.",
        "Level 1: Mentions entities in the query, but lacks specific metrics or factual steps.",
        "Level 2: Contains explicit facts, metrics, or instructions needed to answer the query.",
      ],
    });

    return {
      text: chunkText,
      level: judgment.level,
      confidence: judgment.confidence,
    };
  });

  const results = await Promise.all(gradingPromises);

  results.forEach((res) => {
    if (res.level === 2 && res.confidence >= CONFIG.graderConfidenceThreshold) {
      validatedChunks.push(res.text);
    }
  });

  console.log(`[Jev Grader] Kept ${validatedChunks.length} of ${searchResults.length} retrieved chunks.`);
  return validatedChunks;
}