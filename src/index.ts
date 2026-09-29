import { RAGPipelineHarness } from "./harness";
import { dshWebClient } from "./lib/dshWebClient";
import { CONFIG } from "./config";

async function main() {
  console.log("=== Enterprise Jev / Gemini RAG Pipeline (DSH Web Mode) ===");

  // Pre-flight check for DSH Web Service
  const isDshLive = await dshWebClient.checkHealth();
  if (isDshLive) {
    console.log(`[OK] Connected to DSH Web Service at ${CONFIG.dshWebUrl}`);
  } else {
    console.warn(`[WARNING] DSH Web Service not detected at ${CONFIG.dshWebUrl}.`);
    console.warn(`Ensure you have started it in another terminal with: npx @deepseek-ai/dsh web`);
  }

  console.log("=========================================================");
  console.log(" Starting Gemini API + TypeSafe Jev System 1/2 RAG Run ");
  console.log("=========================================================\n");

  const harness = new RAGPipelineHarness();

  // 1. Seed enterprise document
  console.log("[Setup] Ingesting enterprise documentation...");
  const migrationDoc = `
    Q3 Migration Protocol & Standard Operating Procedures:
    All core database services must be fully migrated to US-East clusters before October 15, 2026.
    Zero downtime requirement: Teams must utilize standard shadow writes for at least 72 hours prior to DNS cutover.
    Contact the DevOps Infrastructure team on Slack (#infrastructure-q3) for approval.
  `.trim();

  await harness.vectorStore.ingestDocument(
    "doc_migration_2026",
    migrationDoc,
    { category: "devops" },
    { chunkSize: 180, chunkOverlap: 30 }
  );

  console.log("[Setup] Vector store status:", harness.vectorStore.getStats());

  // 2. Execute RAG query
  const query = "What is the Q3 migration protocol and deadline?";

  try {
    const finalAnswer = await harness.executeQuery(query);
    console.log("\n-------------------------------------------------");
    console.log(" Verified Final Response:");
    console.log("-------------------------------------------------");
    console.log(finalAnswer);
    console.log("-------------------------------------------------\n");
  } catch (error) {
    console.error("Pipeline Execution Error:", error);
  }
}

main().catch(console.error);