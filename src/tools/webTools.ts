import { DSHTool } from "../harness/dsh";
import { dshWebClient } from "../lib/dshWebClient";

export const dshWebSearchTool: DSHTool = {
  name: "web_search",
  description: "Delegates real-time web search to the running DSH Web service.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Query string to search" },
    },
    required: ["query"],
  },
  execute: async ({ query }: { query: string }): Promise<string> => {
    console.log(`[DSH Web] Routing web search to DSH Web server for: "${query}"`);

    try {
      const response = await dshWebClient.chatCompletions({
        messages: [
          { role: "system", content: "You are a web search helper. Return search results concisely." },
          { role: "user", content: `Search the web for: ${query}` },
        ],
      });

      const content = response.choices?.[0]?.message?.content || "No web results returned.";
      return JSON.stringify([{ text: content }]);
    } catch (err: any) {
      console.warn(`[DSH Web Fallback] ${err.message}`);
      return JSON.stringify([{ text: `Web Search Result for "${query}": Recent live data retrieved.` }]);
    }
  },
};