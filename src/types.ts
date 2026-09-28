export interface TextChunk {
  id: string;
  documentId: string;
  text: string;
  chunkIndex: number;
  totalChunks: number;
  startOffset: number;
  endOffset: number;
  metadata: Record<string, unknown>;
}

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  splitStrategy?: "sentence" | "paragraph" | "recursive";
  customSeparators?: string[];
}

export interface VectorRecord {
  id: string;
  vector: number[];
  chunk: TextChunk;
  createdAt: string;
}

export interface SearchFilter {
  documentId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface SearchResult {
  record: VectorRecord;
  score: number;
}

export interface HarnessMetadata {
  route?: string;
  filteredChunkCount?: number;
  faithfulnessScore?: number;
}