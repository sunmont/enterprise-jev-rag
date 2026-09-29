import { CONFIG } from "../config";

export interface DSHWebExecuteOptions {
  model?: string;
  messages: Array<{ role: string; content: string }>;
  tools?: Array<any>;
}

export class DSHWebClient {
  private baseUrl: string;

  constructor(baseUrl: string = CONFIG.dshWebUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /**
   * Health check to verify `npx @deepseek-ai/dsh web` is running
   */
  public async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/models`, { method: "GET" });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Execute chat completion via local DSH Web server
   */
  public async chatCompletions(options: DSHWebExecuteOptions): Promise<any> {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: options.model || "deepseek-chat",
        messages: options.messages,
        tools: options.tools,
      }),
    });

    if (!response.ok) {
      throw new Error(`DSH Web API Error (${response.status}): ${await response.text()}`);
    }

    return response.json();
  }
}

export const dshWebClient = new DSHWebClient();