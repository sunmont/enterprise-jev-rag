import { VectorStoreManager } from "../services/vectorStore";

export function createVectorTools(vectorStore: VectorStoreManager) {
  return [
    {
      name: "ingest_document",
      description: "Chunk, generate embeddings, and store document content for semantic vector search.",
      parameters: {
        type: "object",
        properties: {
          documentId: { type: "string", description: "Unique document ID" },
          content: { type: "string", description: "Document body text" },
          category: { type: "string", description: "Category metadata label" },
          chunkSize: { type: "number", description: "Max characters per chunk (default 500)" },
          chunkOverlap: { type: "number", description: "Overlap character size (default 50)" },
        },
        required: ["documentId", "content"],
      },
      execute: async (args: {
        documentId: string;
        content: string;
        category?: string;
        chunkSize?: number;
        chunkOverlap?: number;
      }) => {
        const metadata = args.category ? { category: args.category } : {};
        const result = await vectorStore.ingestDocument(args.documentId, args.content, metadata, {
          chunkSize: args.chunkSize,
          chunkOverlap: args.chunkOverlap,
        });
        return JSON.stringify({
          status: "success",
          documentId: args.documentId,
          chunksIngested: result.insertedChunks,
          chunkIds: result.chunkIds,
        });
      },
    },
    {
      name: "vector_search",
      description: "Search internal company vector database for documentation and policies.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query text" },
          topK: { type: "number", description: "Number of top results to return (default 3)" },
          minScore: { type: "number", description: "Minimum similarity score threshold [0..1]" },
        },
        required: ["query"],
      },
      execute: async (args: { query: string; topK?: number; minScore?: number }) => {
        const results = await vectorStore.search(args.query, args.topK ?? 3, args.minScore ?? 0.0);
        return JSON.stringify(
          results.map((res) => ({
            id: res.record.id,
            documentId: res.record.chunk.documentId,
            score: Number(res.score.toFixed(4)),
            text: res.record.chunk.text,
            metadata: res.record.chunk.metadata,
          }))
        );
      },
    },
    {
      name: "manage_vector_store",
      description: "Manage vector store indices or delete document entries by ID.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["stats", "delete_document"] },
          documentId: { type: "string", description: "Target document ID if deleting" },
        },
        required: ["action"],
      },
      execute: async (args: { action: "stats" | "delete_document"; documentId?: string }) => {
        if (args.action === "stats") {
          return JSON.stringify(vectorStore.getStats());
        }
        if (args.action === "delete_document") {
          if (!args.documentId) throw new Error("documentId required for delete_document");
          const deleted = vectorStore.deleteByDocumentId(args.documentId);
          return JSON.stringify({ status: "deleted", documentId: args.documentId, chunksRemoved: deleted });
        }
        throw new Error("Invalid action");
      },
    },
  ];
}