import { JevClient } from "@typesafe/jev";
import { CONFIG } from "../config";

export const jev = new JevClient({ apiKey: CONFIG.TYPESAFE_API_KEY });