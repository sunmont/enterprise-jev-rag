import dotenv from "dotenv";
dotenv.config();

export interface AppConfig {
  dshWebUrl: string;
  typesafeApiKey: string;
  geminiApiKey: string;
  geminiModel: string;
  geminiEmbeddingModel: string;
  logLevel: string;
  faithfulnessThreshold: number;
  graderConfidenceThreshold: number;
}

export const CONFIG: AppConfig = {
  dshWebUrl: process.env.DSH_WEB_URL || "http://127.0.0.1:3080",
  typesafeApiKey: process.env.TYPESAFE_API_KEY || "mock_jev_key",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.8-flash",
  geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004",
  logLevel: process.env.LOG_LEVEL || "info",
  faithfulnessThreshold: parseFloat(process.env.FAITHFULNESS_THRESHOLD || "0.80"),
  graderConfidenceThreshold: parseFloat(process.env.GRADER_CONFIDENCE_THRESHOLD || "0.75"),
};