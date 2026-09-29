import { GoogleGenAI } from "@google/genai";
import { CONFIG } from "../config";

export class GeminiAgent {
  private ai: GoogleGenAI;
  private modelName: string;

  constructor(apiKey: string = CONFIG.geminiApiKey, modelName: string = CONFIG.geminiModel) {
    this.ai = new GoogleGenAI({ apiKey });
    this.modelName = modelName;
  }

  public async generateResponse(prompt: string, contextBlocks: string[]): Promise<string> {
    const systemInstruction = `You are an enterprise System-2 reasoning and synthesis agent.
Answer the user prompt strictly using the verified document contexts provided below.
If the information is not explicitly stated in the context, clearly state that you lack sufficient source data.

Verified Source Contexts:
${contextBlocks.map((c, i) => `[Context ${i + 1}]:\n${c}`).join("\n\n---\n\n")}`;

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    return response.text || "No response generated.";
  }
}

export const geminiAgent = new GeminiAgent();