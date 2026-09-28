import { randomUUID } from "node:crypto";
import { ChunkOptions, TextChunk } from "../types";

export class TextChunker {
  public static chunkDocument(
    documentId: string,
    content: string,
    metadata: Record<string, unknown> = {},
    options: ChunkOptions = {}
  ): TextChunk[] {
    const chunkSize = options.chunkSize ?? 500;
    const chunkOverlap = options.chunkOverlap ?? 50;
    const strategy = options.splitStrategy ?? "recursive";

    let rawSegments: { text: string; start: number; end: number }[] = [];

    switch (strategy) {
      case "sentence":
        rawSegments = this.splitBySentence(content, chunkSize, chunkOverlap);
        break;
      case "paragraph":
        rawSegments = this.splitByParagraph(content, chunkSize, chunkOverlap);
        break;
      case "recursive":
      default:
        rawSegments = this.splitRecursive(
          content,
          chunkSize,
          chunkOverlap,
          options.customSeparators ?? ["\n\n", "\n", ". ", " ", ""]
        );
        break;
    }

    const totalChunks = rawSegments.length;

    return rawSegments.map((seg, idx) => ({
      id: `${documentId}_chunk_${idx}_${randomUUID().slice(0, 8)}`,
      documentId,
      text: seg.text.trim(),
      chunkIndex: idx,
      totalChunks,
      startOffset: seg.start,
      endOffset: seg.end,
      metadata: {
        ...metadata,
        charLength: seg.text.length,
      },
    }));
  }

  private static splitBySentence(text: string, chunkSize: number, overlap: number) {
    const sentences = text.match(/[^.!?]+[.!?]+(\s+|$)\vert{}[^.!?]+$/g) || [text];
    return this.assembleChunks(sentences, text, chunkSize, overlap);
  }

  private static splitByParagraph(text: string, chunkSize: number, overlap: number) {
    const paragraphs = text.split(/\n\s*\n/);
    return this.assembleChunks(paragraphs, text, chunkSize, overlap);
  }

  private static splitRecursive(text: string, chunkSize: number, overlap: number, separators: string[]) {
    const results: { text: string; start: number; end: number }[] = [];

    function processBlock(blockText: string, globalOffset: number) {
      if (blockText.length <= chunkSize) {
        results.push({ text: blockText, start: globalOffset, end: globalOffset + blockText.length });
        return;
      }

      let chosenSep = separators.find((sep) => blockText.includes(sep));
      if (chosenSep === undefined) chosenSep = "";

      const parts = chosenSep !== "" ? blockText.split(chosenSep) : Array.from(blockText);
      let currentChunk = "";
      let chunkStart = globalOffset;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const projected = currentChunk.length === 0 ? part : currentChunk + chosenSep + part;

        if (projected.length > chunkSize && currentChunk.length > 0) {
          results.push({ text: currentChunk, start: chunkStart, end: chunkStart + currentChunk.length });
          const stepBack = Math.min(currentChunk.length, overlap);
          const nextStartOffset = currentChunk.length - stepBack;
          currentChunk = currentChunk.slice(nextStartOffset) + chosenSep + part;
          chunkStart = chunkStart + nextStartOffset;
        } else {
          currentChunk = projected;
        }
      }

      if (currentChunk.trim().length > 0) {
        results.push({ text: currentChunk, start: chunkStart, end: chunkStart + currentChunk.length });
      }
    }

    processBlock(text, 0);
    return results;
  }

  private static assembleChunks(units: string[], fullText: string, maxSize: number, overlap: number) {
    const chunks: { text: string; start: number; end: number }[] = [];
    let currentText = "";
    let searchPointer = 0;

    for (const unit of units) {
      if ((currentText + unit).length > maxSize && currentText.length > 0) {
        const start = fullText.indexOf(currentText.trim(), searchPointer);
        const end = start + currentText.trim().length;
        chunks.push({ text: currentText.trim(), start: Math.max(0, start), end });
        searchPointer = Math.max(0, end - overlap);
        currentText = currentText.slice(-overlap) + unit;
      } else {
        currentText += unit;
      }
    }

    if (currentText.trim().length > 0) {
      const start = fullText.indexOf(currentText.trim(), searchPointer);
      const end = start + currentText.trim().length;
      chunks.push({ text: currentText.trim(), start: Math.max(0, start), end });
    }

    return chunks;
  }
}