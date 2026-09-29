import { jev } from "../../lib/jevClient";

export async function runRouterHook(userPrompt: string): Promise<string> {
  try {
    const routing = await jev.choice({
      state: `User Request: ${userPrompt}`,
      options: [
        {
          name: "vector_search",
          description:
            "Use when the user asks about internal strategy, company policies, technical specs, or proprietary protocols.",
        },
        {
          name: "web_search",
          description:
            "Use when the user explicitly asks about real-time external market events, public news, or global facts.",
        },
        {
          name: "direct_answer",
          description:
            "Use ONLY when the user prompt is a greeting or pleasantry requiring no external facts.",
        },
      ],
    });

    console.log(`[Jev Router] Selected Route: '${routing.selection}' (Confidence: ${(routing.confidence * 100).toFixed(1)}%)`);
    return routing.selection;
  } catch (error) {
    console.warn("[Jev Router Warning] Jev service unavailable. Failing open to 'vector_search'.", error);
    return "vector_search";
  }
}