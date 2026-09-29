import { ChunkOptions, SearchFilter, SearchResult, VectorRecord } from "../types";
import { TextChunker } from "./chunker";
import { IEmbeddingProvider, VectorMath } from "./embedding";

export class VectorStoreManager {
  private records: Map<string, VectorRecord> = new Map();
  private embeddingProvider: IEmbeddingProvider;

  constructor(embeddingProvider: IEmbeddingProvider) {
    this.embeddingProvider = embeddingProvider;
  }

  public async ingestDocument(
    documentId: string,
    content: string,
    metadata: Record<string, unknown> = {},
    chunkOptions?: ChunkOptions
  ): Promise<{ insertedChunks: number; chunkIds: string[] }> {
    const chunks = TextChunker.chunkDocument(documentId, content, metadata, chunkOptions);
    if (chunks.length === 0) return { insertedChunks: 0, chunkIds: [] };

    const texts = chunks.map((c) => c.text);
    const vectors = await this.embeddingProvider.embedBatch(texts);
    const chunkIds: string[] = [];
    const now = new Date().toISOString();

    for (let i = 0; i < chunks.length; i++) {
      const record: VectorRecord = {
        id: chunks[i].id,
        vector: vectors[i],
        chunk: chunks[i],
        createdAt: now,
      };

      this.records.set(record.id, record);
      chunkIds.push(record.id);
    }

    return { insertedChunks: chunks.length, chunkIds };
  }

  public async search(
    queryText: string,
    topK = 5,
    minScore = 0.0,
    filter?: SearchFilter
  ): Promise<SearchResult[]> {
    const queryVector = await this.embeddingProvider.embedText(queryText);
    const results: SearchResult[] = [];

    for (const record of this.records.values()) {
      if (filter) {
        if (filter.documentId && record.chunk.documentId !== filter.documentId) continue;
        if (filter.metadata) {
          let matches = true;
          for (const [key, val] of Object.entries(filter.metadata)) {
            if (record.chunk.metadata[key] !== val) {
              matches = false;
              break;
            }
          }
          if (!matches) continue;
        }
      }

      const score = VectorMath.cosineSimilarity(queryVector, record.vector);
      if (score >= minScore) {
        results.push({ record, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  public deleteByDocumentId(documentId: string): number {
    let deletedCount = 0;
    for (const [id, record] of this.records.entries()) {
      if (record.chunk.documentId === documentId) {
        this.records.delete(id);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  public getStats() {
    const documentIds = new Set<string>();
    for (const record of this.records.values()) {
      documentIds.add(record.chunk.documentId);
    }
    return {
      totalChunks: this.records.size,
      totalDocuments: documentIds.size,
      dimension: this.embeddingProvider.dimension,
    };
  }
}