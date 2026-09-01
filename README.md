# Edaad Schema Architect

> **AI-powered database schema designer** — where ChatGPT and humans design together in real time via WebMCP.

[![WebMCP](https://img.shields.io/badge/WebMCP-Enabled-blue)](https://webmcp.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-green)](https://edaad-schema-architect.netlify.app)

---

## What is this?

Edaad Schema Architect is a **WebMCP-powered** visual database schema designer that lets ChatGPT and developers collaborate in real time. ChatGPT can create tables, add columns, draw relationships, analyze schemas, import SQL files, and export to multiple formats — all by calling WebMCP tools that directly manipulate a live React canvas in the browser.

**Built for the [WebMCP Challenge Hackathon](https://webmcp.devpost.com)**

---

## Why WebMCP?

Database schema design is fundamentally collaborative — but traditionally, AI can only *suggest* SQL in a chat window while the developer manually implements it elsewhere. WebMCP changes this:

- ChatGPT **directly manipulates** the visual canvas — no copy-paste, no context switching
- The schema state is **shared** between human and AI in real time
- The developer stays in control — they see every change on canvas and can undo it

---

## Features

### WebMCP Tools Available to ChatGPT (15 tools)

| Tool | Description |
|------|-------------|
| `create_table` | Create a new table with columns on the canvas |
| `add_relation` | Draw a foreign key arrow between two tables |
| `analyze_schema` | Read and summarize the full current schema |
| `list_tables` | Get all table names (avoids duplicates) |
| `clear_schema` | Reset the canvas |
| `update_column` | Modify an existing column |
| `add_column` | Add a new column to an existing table |
| `add_timestamps_to_all_tables` | Batch-add created_at + updated_at to every table |
| `export_to_sql` | Generate SQL with FK constraints |
| `suggest_improvements` | Detect missing PKs, timestamps, orphan tables |
| `diagnose_schema_problem` | Compare a dev's error against the schema |
| `check_schema_consistency` | Validate schema supports a feature (auth, multi-tenancy…) |
| `import_schema_from_sql` | Parse SQL CREATE TABLE statements onto canvas |
| `import_schema_from_prisma` | Parse Prisma schema models onto canvas |
| `delete_table` | Remove a table and its relations |
| `delete_relation` | Remove a specific relation arrow |

### UI Features
- 🎨 Visual canvas with drag-and-drop table positioning
- ↩️ Undo / Redo (50 steps)
- 📥 Import SQL or Prisma via file upload or paste
- ⬇️ Export to PostgreSQL / MySQL / SQLite / Prisma / Drizzle ORM / TypeScript
- 🔗 Shareable schema URLs
- 📋 Pre-built templates (E-commerce, Blog, SaaS, etc.)
- ⚠️ Schema validation warnings

---

## Example Prompts for ChatGPT

```
"Build me a schema for a multi-tenant SaaS app with users, organizations, and subscriptions"

"Import this SQL and fix the missing relations: [paste SQL]"

"Check if this schema supports user authentication with roles"

"Add created_at and updated_at to all tables"

"What's wrong with my schema? I'm getting a foreign key constraint error on orders.user_id"
```

---

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Canvas**: React Flow
- **WebMCP**: `use-webmcp-tool` React hook
- **Styling**: Vanilla CSS (glassmorphism dark theme)
- **Deployment**: Netlify / Cloudflare Pages

---

## Getting Started

```bash
git clone https://github.com/abutameemrdp/edaad-schema.git
cd edaad-schema
npm install
npm run dev
```

Open `http://localhost:5173` in a browser with WebMCP enabled, then use ChatGPT to interact with the schema.

---

## How to Use with ChatGPT

1. Open the live URL in Chrome with the WebMCP extension, or use ChatGPT's built-in browser
2. ChatGPT will automatically detect the available tools
3. Tell ChatGPT what schema you want to build or analyze

---

## License

[MIT](./LICENSE) — Open source, free to use and modify.
