import { createHarness } from "./harness";

async function main() {
  console.log("=================================================");
  console.log(" Starting DSH + Pi Agent + TypeSafe Jev RAG Run ");
  console.log("=================================================\n");

  const { harness, vectorStore } = createHarness();

  // 1. Ingest enterprise document chunks into the store
  console.log("[Setup] Ingesting enterprise documentation...");
  const migrationDoc = `
    Q3 Migration Protocol & Standard Operating Procedures:
    All core database services must be fully migrated to US-East clusters before October 15, 2026.
    Zero downtime requirement: Teams must utilize standard shadow writes for at least 72 hours prior to DNS cutover.
    Contact the DevOps Infrastructure team on Slack (#infrastructure-q3) for approval.
  `.trim();

  await vectorStore.ingestDocument("doc_migration_2026", migrationDoc, { category: "devops" }, { chunkSize: 180, chunkOverlap: 30 });
  console.log(`[Setup] Vector store status:`, vectorStore.getStats());

  // 2. Execute agent query loop
  const query = "What is the Q3 migration protocol and deadline?";
  console.log(`\nUser Prompt: "${query}"\n`);

  try {
    const finalAnswer = await harness.run(query);
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