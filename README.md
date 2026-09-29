# Enterprise System 1 / System 2 RAG Agent (Pi + Jev + DeepSeek Harness)

A production-grade, TypeScript-native Retrieval-Augmented Generation (RAG) agent stack implementing a **System 1 (Jev Decision Engine) / System 2 (Pi Coding Agent)** architectural split managed by the **DeepSeek Harness (DSH)**.

---

## 🏛️ Architecture & Pipeline Flow

```text
              +-----------------------+
                              |   User Query Input    |
                              +-----------+-----------+
                                          |
                                          v
                          +-------------------------------+
                          | System 1 Router (Jev / SDK)   |
                          +---------------+---------------+
                                          |
                  +-----------------------+-----------------------+
                  |                                               |
                  v                                               v
    [ Route: vector_search ]                            [ Route: web_search ]
                  |                                               |
    +-------------+-------------+                  +--------------+--------------+
    | Local Vector Store Search |                  | DSH Web Service (dsh web)   |
    +-------------+-------------+                  +--------------+--------------+
                  |                                               |
                  +-----------------------+-----------------------+
                                          |
                                          v
                          +-------------------------------+
                          | System 1 Relevance Grader     |
                          +---------------+---------------+
                                          |
                                          v
                          +-------------------------------+
                          | System 2 Reasoning & Synthesis|
                          |   (Gemini - gemini-3.8-flash) |
                          +---------------+---------------+
                                          |
                                          v
                          +-------------------------------+
                          | System 1 Faithfulness Guardrail|
                          +---------------+---------------+
                                          |
                                          v
                               [ Verified Final Answer ]
```

---

---

## 🚀 Key Features

* **System 1 / System 2 Dual-Cognition**: Lightweight, low-latency classification and evaluation paired with deep LLM synthesis.
* **DSH Web Integration**: Offloads live web searching and search proxying to `npx @deepseek-ai/dsh web`.
* **Dynamic Routing**: Automatically directs queries to either local vector stores or live web searches based on query intent.
* **Relevance & Faithfulness Validation**: Filters retrieved chunks for query relevance and verifies synthesized outputs against hallucination risk prior to display.

---

## 🛠️️ Tech Stack & Dependencies

* **Language**: TypeScript (`ts-node`, `typescript`)
* **System 1 Engine**: `@typesafe-ai/sdk` (`^0.6.0`)
* **System 2 Engine**: `@google/genai` (`^0.1.1` using `gemini-3.8-flash`)
* **Embeddings**: Gemini `text-embedding-004` (with fallback local normalized mock vector provider)
* **Web Harness**: DeepSeek Harness (`@deepseek-ai/dsh`) executed via `npx`

---

## 📋 Prerequisites

* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher
* **Google Gemini API Key**: [Get a Gemini API Key](https://aistudio.google.com/)
* **TypeSafe AI API Key**: [Get a TypeSafe AI Key](https://typesafe.ai/)

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
DSH_WEB_URL=[http://127.0.0.1:3080](http://127.0.0.1:3080)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004
TYPESAFE_API_KEY=your_typesafe_api_key_here
## 📦 Project Structure

```text
enterprise-jev-rag/
├── src/
│   ├── config.ts              # Global environment configuration
│   ├── index.ts               # Main application entrypoint & pre-flight checks
│   ├── harness/
│   │   ├── dsh.ts             # DeepSeek Harness context, tools, & hooks registry
│   │   ├── index.ts           # RAGPipelineHarness orchestrator
│   │   └── hooks/             # System 1 Router, Grader, & Guardrail hooks
│   ├── lib/
│   │   ├── dshWebClient.ts    # Client adapter for DSH Web REST API
│   │   ├── geminiAgent.ts     # System 2 synthesis agent wrapper
│   │   ├── jevClient.ts       # System 1 TypeSafe AI primitives wrapper
│   │   └── piAgent.ts         # Backward compatibility re-export
│   ├── services/
│   │   ├── embedding.ts       # Gemini & local mock embedding providers
│   │   └── vectorStore.ts     # In-memory vector database & indexing
│   └── tools/
│       ├── vectorTools.ts     # Vector search tool definition
│       └── webTools.ts        # DSH web search tool adapter
├── .env                       # Environment variables (git-ignored)
├── package.json
├── tsconfig.json
└── README.md
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
npm install
```

### Configuration
Copy `.env.example` to `.env` and configure your API keys:
```env
DSH_WEB_URL=[http://127.0.0.1:3080](http://127.0.0.1:3080)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004
TYPESAFE_API_KEY=your_typesafe_api_key_here
```

### Running the RAG Pipeline
```bash
# Development mode with hot-reloading
cd enterprise-jev-rag

# Type check & production build
npm install
npm run typecheck

npm start

Start the DSH Web Service (Terminal 1)
Run DeepSeek Harness in web mode to listen for search and tool routing requests (default port 3080):
npx @deepseek-ai/dsh web
```
