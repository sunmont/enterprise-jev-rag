import { PiAgent } from "@earendil-works/pi-coding-agent";
import { CONFIG } from "../config";

export const piAgent = new PiAgent({
  model: "claude-3-5-sonnet-20241022",
  apiKey: CONFIG.ANTHROPIC_API_KEY,
  sessionPersistence: true,
});