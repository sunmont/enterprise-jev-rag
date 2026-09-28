# Enterprise System 1 / System 2 RAG Agent (Pi + Jev + DeepSeek Harness)

A production-grade, TypeScript-native Retrieval-Augmented Generation (RAG) agent stack implementing a **System 1 (Jev Decision Engine) / System 2 (Pi Coding Agent)** architectural split managed by the **DeepSeek Harness (DSH)**.

---

## 🏛️ Architecture & Pipeline Flow

```text
               ┌──────────────────────────────────┐
               │        User Query Inbound        │
               └─────────────────┬────────────────┘
                                 │
                                 ▼
               ┌──────────────────────────────────┐
               │   Jev Router ('Choice' Primitive)│ ◄─── System 1 (~50ms)
               └─────────────────┬────────────────┘
                                 │ [Selects 'vector_search']
                                 ▼
               ┌──────────────────────────────────┐
               │  Vector Database Retrieval (ANN) │
               └─────────────────┬────────────────┘
                                 │
                                 ▼
               ┌──────────────────────────────────┐
               │  Jev Grader ('Score' Primitive)  │ ◄─── System 1 Filter
               └─────────────────┬────────────────┘
                                 │ [Drops Level 0 & 1 Chunks]
                                 ▼
               ┌──────────────────────────────────┐
               │  Pi Agent Synthesis Engine       │ ◄─── System 2 (Generative)
               └─────────────────┬────────────────┘
                                 │
                                 ▼
               ┌──────────────────────────────────┐
               │ Jev Guardrail ('Noul' Primitive) │ ◄─── System 1 Safety Gate
               └─────────────────┬────────────────┘
                                 │ [Passes >80% Faithfulness]
                                 ▼
               ┌──────────────────────────────────┐
               │        Verified Final Output     │
               └──────────────────────────────────┘
```

---

## 🚀 Key Features

1. **System 1 / System 2 Division of Labor**:
   - **System 1 (`@typesafe/jev`)**: Deterministic, low-latency primitives (`choice`, `score`, `noul`) handling intent routing, chunk grading, and hallucination guardrails.
   - **System 2 (`@earendil-works/pi-coding-agent`)**: Deep reasoning, tool execution, and response synthesis powered by Claude 3.5 Sonnet.
2. **DeepSeek Harness (`@deepseek-ai/dsh`)**: Event-driven lifecycle orchestration (`before_turn`, `tool_result`, `before_response`) connecting system components cleanly.
3. **Advanced Vector Pipeline**: Recursive and semantic document chunking, batched embeddings, cosine similarity metrics, and metadata filtering.

---

## 📦 Project Structure

```text
enterprise-jev-rag/
├── src/
│   ├── config.ts                  # Environment variables & confidence thresholds
│   ├── index.ts                   # Entry point (document ingestion & query runner)
│   ├── types.ts                   # Core type definitions
│   ├── harness/
│   │   ├── index.ts               # Harness creation & lifecycle hook registration
│   │   └── hooks/
│   │       ├── routerHook.ts      # Jev Intent Router
│   │       ├── graderHook.ts      # Jev Chunk Grader
│   │       └── guardrailHook.ts   # Jev Faithfulness Guardrail
│   ├── lib/
│   │   ├── jevClient.ts           # Jev SDK Client wrapper
│   │   └── piAgent.ts             # Pi Coding Agent client wrapper
│   ├── services/
│   │   ├── chunker.ts             # Recursive & sentence document chunker
│   │   ├── embedding.ts           # OpenAI & Local Mock embedding providers
│   │   └── vectorStore.ts         # In-memory vector database & cosine ANN search
│   └── tools/
│       └── vectorTools.ts         # Harness tools (ingest, search, manage)
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js `>= 20.0.0`
- `pnpm`

### Installation
```bash
git clone https://github.com/enterprise/enterprise-jev-rag.git
cd enterprise-jev-rag
pnpm install
```

### Configuration
Copy `.env.example` to `.env` and configure your API keys:
```env
TYPESAFE_API_KEY=your_jev_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key # Optional; defaults to local mock embeddings
GRADER_CONFIDENCE_THRESHOLD=0.75
FAITHFULNESS_THRESHOLD=0.80
```

### Running the RAG Pipeline
```bash
# Development mode with hot-reloading
pnpm dev

# Type check & production build
pnpm build
pnpm start
```
