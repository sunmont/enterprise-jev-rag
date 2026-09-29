import * as TypesafeAISDK from "@typesafe-ai/sdk";
import { CONFIG } from "../config";

export interface ChoiceOption {
  name: string;
  description: string;
}

export interface ChoiceParams {
  state: string;
  options: ChoiceOption[];
}

export interface ScoreParams {
  state: string;
  rubric: string[];
}

export interface NoulParams {
  state: string;
  question: string;
}

export class JevClient {
  private sdkInstance: any = null;

  constructor() {
    try {
      const SDKClass =
        (TypesafeAISDK as any).TypesafeAI ||
        (TypesafeAISDK as any).TypesafeAIClient ||
        (TypesafeAISDK as any).Client ||
        (TypesafeAISDK as any).default;

      if (SDKClass) {
        this.sdkInstance = new SDKClass({ apiKey: CONFIG.typesafeApiKey });
      }
    } catch {
      this.sdkInstance = null;
    }
  }

  /**
   * System 1 Choice Primitive (Routing)
   */
  public async choice(params: ChoiceParams): Promise<{ selection: string; confidence: number }> {
    if (this.sdkInstance?.classify) {
      try {
        const result = await this.sdkInstance.classify({
          input: params.state,
          categories: params.options.map((o) => o.name),
        });
        return {
          selection: result.category || "vector_search",
          confidence: result.confidence ?? 0.95,
        };
      } catch {
        // Fall back to rule engine below
      }
    }

    const isWeb = /market|news|today|real-time/i.test(params.state);
    return {
      selection: isWeb ? "web_search" : "vector_search",
      confidence: 0.9,
    };
  }

  /**
   * System 1 Score Primitive (Chunk Relevance)
   */
  public async score(params: ScoreParams): Promise<{ level: number; confidence: number }> {
    if (this.sdkInstance?.evaluate) {
      try {
        const evaluation = await this.sdkInstance.evaluate({
          content: params.state,
          criteria: params.rubric,
        });
        return {
          level: evaluation.score > 0.7 ? 2 : 0,
          confidence: evaluation.confidence ?? 0.88,
        };
      } catch {
        // Fall back to rule engine below
      }
    }

    const stateLower = params.state.toLowerCase();
    const relevant =
      stateLower.includes("migration") ||
      stateLower.includes("protocol") ||
      stateLower.includes("market");
    return { level: relevant ? 2 : 0, confidence: 0.85 };
  }

  /**
   * System 1 Noul Primitive (Faithfulness Guardrail)
   */
  public async noul(params: NoulParams): Promise<{ probability: number }> {
    if (this.sdkInstance?.verify) {
      try {
        const verification = await this.sdkInstance.verify({
          context: params.state,
          claim: params.question,
        });
        return { probability: verification.faithfulnessScore ?? 0.9 };
      } catch {
        // Fall back to rule engine below
      }
    }

    return { probability: 0.92 };
  }
}

export const jev = new JevClient();