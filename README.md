# Claude ARA Agents

> Make any website understandable by AI agents — in minutes, with Claude Code.

This repository provides two Claude Code agents and a `/ara` skill that implement the **ARA (Agent-Ready Architecture)** standard for any website.

**One command. Three files generated. Any site becomes agent-ready.**

```bash
/ara transform https://yoursite.com
```

---

## Why ARA instead of llms.txt

`llms.txt` is a good first step. ARA is where it leads.

| | llms.txt | ARA |
|--|---------|-----|
| **Format** | Plain text, markdown links | Structured JSON |
| **What it tells an agent** | "Here are some links" | "Here's what I am, what I contain, and what you can do" |
| **Data schemas** | None | JSON Schema + Schema.org annotations |
| **Agent actions** | None | Full query/mutation definitions |
| **Protocol support** | None | REST, MCP, A2A, GraphQL |
| **Access policies** | None | Rate limits, auth scopes, data usage rights |
| **Agent token cost** | ~800 tokens to parse | ~150 tokens for manifest |
| **GEO layer** | None | `digest.md` — 300-token AI-optimized summary |
| **Machine-readable** | Partially | Fully |
| **Intent mapping** | None | Natural language → action routing |
| **Validation** | None | `npx ara-validate` — score A-F |

### The core difference

`llms.txt` tells a language model where to look.  
ARA tells an AI agent **what the site is, how it's structured, and what it can do** — without loading a single HTML page.

```
llms.txt                          ARA manifest.json
─────────────────────────         ─────────────────────────────────────────
# My Site                         {
                                    "$ara": "1.0",
> A SaaS platform                   "identity": {
                                      "name": "MySite",
## Docs                               "type": "saas",
- [Getting Started](...)              "description": "Project management..."
- [API Reference](...)              },
                                    "content_map": {
## Features                           "resources": [
- [Pricing](...)                        { "id": "projects", "count": 1200,
- [Changelog](...)                        "schema_ref": "schemas/project.json" }
                                        ]
                                    },
                                    "capabilities": {
                                      "actions_ref": "actions.json"
                                    }
                                  }
```

An agent reading `llms.txt` must still fetch and parse every linked page to understand what the site does.  
An agent reading `manifest.json` **already knows** — before making a single additional request.

### Token cost comparison

| Task | llms.txt | ARA |
|------|---------|-----|
| Understand what the site is | ~400 tokens (parse prose) | ~80 tokens (read `identity`) |
| Find what data is available | ~1,200 tokens (fetch + parse pages) | ~150 tokens (read `content_map.resources`) |
| Know what actions are possible | Not possible | ~300 tokens (read `actions.json`) |
| Total to understand + act | **~2,000–5,000 tokens** | **~150–400 tokens** |

**ARA reduces agent token consumption by 10-20x.**

### Migration path

Have a `llms.txt`? Keep it. ARA is additive.

```bash
/ara migrate https://yoursite.com
```

This reads your existing `llms.txt` and converts every section into proper ARA structure — no data lost, everything promoted to machine-readable format.

---

## What gets generated

```
.well-known/ara/
├── manifest.json         Layer 1 — Identity, content map, capabilities, policies
├── schemas/
│   ├── products.json     Layer 2 — Semantic schemas with Schema.org annotations
│   └── articles.json
├── actions.json          Layer 3 — Queries and mutations an agent can execute
└── digest.md             GEO layer — ~300-token LLM-optimized summary
```

### Layer 1 — Discovery (`manifest.json`)

The single entry point. An agent reads this one file and understands the entire site.

```json
{
  "$ara": "1.0",
  "identity": {
    "name": "ByteWire",
    "type": "news_media",
    "description": "Technology news with 2,400+ articles across AI, Web Dev, Security, Open Source, Hardware."
  },
  "content_map": {
    "summary": "Tech news site, 2,400 articles, 5 categories",
    "resources": [
      { "id": "articles", "type": "content", "count": 2400, "schema_ref": "schemas/article.json" }
    ]
  },
  "capabilities": { "actions_ref": "actions.json" },
  "policies": { "agent_access": "public", "rate_limit": { "requests_per_minute": 30 } }
}
```

### Layer 2 — Understanding (`schemas/`)

Every resource gets a semantic schema. Each field maps to a Schema.org property — this is the GEO layer that makes content citable by AI engines.

```json
{
  "$ara_schema": "1.0",
  "extends": "schema:Article",
  "properties": {
    "title":    { "type": "string", "semantic": "schema:headline" },
    "author":   { "type": "string", "semantic": "schema:author" },
    "category": { "type": "string", "semantic": "schema:articleSection" }
  },
  "search_hints": {
    "filterable_by": ["category", "author"],
    "text_searchable": ["title", "description"]
  }
}
```

### Layer 3 — Interaction (`actions.json`)

Everything an agent can do, with natural language intent mappings.

```json
{
  "actions": [
    {
      "id": "search_articles",
      "type": "query",
      "intents": ["Find articles about AI agents", "Latest posts on LLMs", "Security news this week"],
      "input": { "query": "string", "category": "string" },
      "protocols": {
        "rest":     { "method": "GET", "path": "/api/articles" },
        "mcp_tool": { "name": "search_articles" }
      }
    }
  ]
}
```

### GEO layer (`digest.md`)

A 200–400 token plain-text summary optimized for AI engines (ChatGPT, Perplexity, Claude, Gemini). Dense in facts, no marketing language.

```markdown
# ByteWire — Agent Digest

## Identity
Technology news site. 2,400+ articles published since 2019. 5 categories: AI/LLMs (840 articles),
Web Dev (510), Security (380), Open Source (420), Hardware (250).

## Key Capabilities
- Search articles by keyword, category, author, or date range
- Fetch full article content with author bio
- Filter by publication date or tag

## Policies
- Access: public, no authentication
- Rate limit: 30 req/min, caching allowed (30-min TTL)
- License: CC BY-NC 4.0
```

---

## Installation

### Requirements

- [Claude Code](https://claude.ai/code) CLI installed
- `~/.claude/agents/` directory (auto-created by Claude Code)

### Install (one command)

```bash
curl -fsSL https://raw.githubusercontent.com/ARA-Standard/claude-ara-agents/main/install.sh | bash
```

### Install manually

```bash
# Clone the repo
git clone https://github.com/ARA-Standard/claude-ara-agents.git
cd claude-ara-agents

# Run the installer
./install.sh
```

### What gets installed

```
~/.claude/agents/ara-auditor.md      Audit agent (read-only)
~/.claude/agents/ara-transformer.md  Generator agent (writes files)
~/.claude/skills/ara/SKILL.md        /ara slash command
```

---

## Usage

### Audit any site

```bash
/ara audit https://yoursite.com
```

Returns a scored report (A–F) with breakdown, issues, and next steps.

### Transform any site to ARA

```bash
/ara transform https://yoursite.com
```

Generates the full ARA file set in `.well-known/ara/`. Works with live URLs and local codebases.

### Migrate from llms.txt

```bash
/ara migrate https://yoursite.com
```

Detects your `llms.txt`, extracts all content, and converts it into proper ARA structure.

### Optimize for AI search (GEO)

```bash
/ara geo https://yoursite.com
```

Regenerates `digest.md` and adds Schema.org `semantic` annotations to all schemas. Improves citability in ChatGPT, Perplexity, Google AIO, and Claude.

### Quick compliance check

```bash
/ara quick https://yoursite.com
# → Level: 1 | Grade: C (72/100) | Top issue: actions.json absent
```

### Validate with the official CLI

```bash
/ara validate https://yoursite.com
# Runs: npx ara-validate https://yoursite.com
```

---

## Command reference

| Command | Description | Agents |
|---------|-------------|--------|
| `/ara audit <url>` | Full compliance report, A-F score | ara-auditor |
| `/ara transform <url>` | Generate all ARA files | ara-auditor → ara-transformer |
| `/ara migrate <url>` | Convert llms.txt → ARA | ara-auditor → ara-transformer |
| `/ara validate <url>` | Run npx ara-validate | Bash |
| `/ara geo <url>` | Optimize digest.md + Schema.org | ara-transformer |
| `/ara quick <url>` | 30-second snapshot | ara-auditor |

All commands also work on local paths:

```bash
/ara transform ./my-project
/ara audit ./my-project/.well-known/ara
```

---

## Architecture

Two specialized agents, one skill:

```
/ara <command>
    │
    ├─ ara-auditor       Read-only. Scores compliance. Detects llms.txt.
    │                    Never writes files.
    │
    └─ ara-transformer   Generates ARA files. 7-phase pipeline:
                         1. Intelligence gathering (fetch + crawl)
                         2. llms.txt migration (if present)
                         3. manifest.json (Layer 1)
                         4. schemas/ (Layer 2 + Schema.org)
                         5. actions.json (Layer 3 + intent mapping)
                         6. digest.md (GEO optimization)
                         7. Validation (npx ara-validate)
```

The auditor always runs before the transformer in `/ara transform` to avoid regenerating files that already exist and to detect the current ARA level.

---

## Examples

The `examples/` directory contains real ARA output for 4 site types:

- `examples/ecommerce/` — fashion boutique, REST + MCP
- `examples/saas/` — project management platform, MCP + A2A
- `examples/media/` — tech news site, 2,400 articles
- `examples/restaurant/` — local business, reservations

---

## ARA Adoption Levels

| Level | Files | Agent token cost | Capability |
|-------|-------|-----------------|------------|
| 0 | Nothing | ~2,000 (HTML parse) | Agent must scrape |
| 1 | manifest.json | ~150 | Identity + content map |
| 2 | + schemas/ | ~250 | Data structure + Schema.org |
| 3 | + actions.json | ~350 | Execute queries + mutations |
| 4 | + MCP/A2A | ~350 | Native LLM tool calls |

Start at Level 1 (one file, 30 minutes). The agents take you to Level 3 in a single command.

---

## ARA Specification

The full ARA v1.0 specification:
- [Layer 1 — manifest.json](https://ara-standard.org/spec/v1.0/manifest)
- [Layer 2 — schemas/](https://ara-standard.org/spec/v1.0/schemas)
- [Layer 3 — actions.json](https://ara-standard.org/spec/v1.0/actions)

Validate your implementation:
```bash
npx ara-validate https://yoursite.com
```

---

## Contributing

These agents are open-source under CC BY 4.0.

- Found a bug? [Open an issue](https://github.com/ARA-Standard/claude-ara-agents/issues)
- Want to add support for a new site type? [Submit a PR](https://github.com/ARA-Standard/claude-ara-agents/pulls)
- Questions? [Discussions](https://github.com/ARA-Standard/claude-ara-agents/discussions)

---

## License

CC BY 4.0 — Free to use, modify, and redistribute with attribution.

Built on the [ARA Standard](https://ara-standard.org) — the open web standard for the agentic web.
