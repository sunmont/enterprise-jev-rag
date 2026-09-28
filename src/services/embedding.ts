export interface IEmbeddingProvider {
  dimension: number;
  embedText(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export class OpenAIEmbeddingProvider implements IEmbeddingProvider {
  public dimension: number;
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = "text-embedding-3-small", dimension = 1536) {
    this.apiKey = apiKey;
    this.model = model;
    this.dimension = dimension;
  }

  public async embedText(text: string): Promise<number[]> {
    const [vec] = await this.embedBatch([text]);
    return vec;
  }

  public async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, input: texts, dimensions: this.dimension }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI Embedding API error: ${response.statusText}`);
    }

    const data = (await response.json()) as { data: { embedding: number[] }[] };
    return data.data.map((item) => item.embedding);
  }
}

export class LocalMockEmbeddingProvider implements IEmbeddingProvider {
  public dimension: number;

  constructor(dimension = 384) {
    this.dimension = dimension;
  }

  public async embedText(text: string): Promise<number[]> {
    const vec = new Array<number>(this.dimension).fill(0);
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const idx = (charCode + i) % this.dimension;
      vec[idx] += Math.sin(charCode * (i + 1));
    }
    return VectorMath.normalize(vec);
  }

  public async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embedText(t)));
  }
}

export class VectorMath {
  public static dotProduct(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
    return sum;
  }

  public static magnitude(v: number[]): number {
    let sum = 0;
    for (let i = 0; i < v.length; i++) sum += v[i] * v[i];
    return Math.sqrt(sum);
  }

  public static normalize(v: number[]): number[] {
    const mag = this.magnitude(v);
    if (mag === 0) return v;
    return v.map((x) => x / mag);
  }

  public static cosineSimilarity(a: number[], b: number[]): number {
    const magA = this.magnitude(a);
    const magB = this.magnitude(b);
    if (magA === 0 || magB === 0) return 0;
    return this.dotProduct(a, b) / (magA * magB);
  }
}