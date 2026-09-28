import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  TYPESAFE_API_KEY: process.env.TYPESAFE_API_KEY || "mock_jev_key",
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "mock_anthropic_key",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  GRADER_CONFIDENCE_THRESHOLD: parseFloat(process.env.GRADER_CONFIDENCE_THRESHOLD || "0.75"),
  FAITHFULNESS_THRESHOLD: parseFloat(process.env.FAITHFULNESS_THRESHOLD || "0.80"),
};