---
name: ara
description: >
  ARA (Agent-Ready Architecture) skill. Makes any website AI-agent-ready by
  generating ARA files (manifest.json, schemas/, actions.json, digest.md).
  Orchestrates ara-auditor and ara-transformer agents. Replaces llms.txt with
  a structured ARA implementation. Improves GEO (Generative Engine Optimization)
  through semantic schemas and an AI-optimized digest.md. Use when user says
  "ara", "agent-ready", "ARA compliance", "ARA manifest", "migrate llms.txt",
  "GEO optimize", "agent-readable", "AI-ready website", or provides a URL for
  ARA work.
allowed-tools: Read, Bash, WebFetch, Glob, Grep, Write
---

# ARA — Agent-Ready Architecture

> **Standard ARA** — The open standard that gives every website a front door for AI agents.
> Just as `robots.txt` taught crawlers where to go, ARA tells AI agents what a site is,
> what it contains, and how to interact with it.

ARA reduces agent token consumption by **10-20x** compared to HTML/DOM parsing.
It replaces `llms.txt` with a structured 3-layer architecture.

---

## Quick Reference

| Command | What It Does | Agents Used |
|---------|-------------|-------------|
| `/ara audit <url>` | Score A-F, detect gaps, find llms.txt | ara-auditor |
| `/ara transform <url>` | Generate all ARA files | ara-auditor → ara-transformer |
| `/ara migrate <url>` | Convert existing llms.txt to ARA | ara-auditor → ara-transformer |
| `/ara validate <url>` | Run npx ara-validate, return score | Bash only |
| `/ara geo <url>` | Optimize digest.md for AI citability | ara-transformer (--geo) |
| `/ara quick <url>` | 30-second ARA readiness snapshot | ara-auditor |
| `/ara` | Show this help | — |

---

## What ARA Generates

```
.well-known/ara/
├── manifest.json     Layer 1 — Site identity, content map, capabilities, policies
├── schemas/
│   ├── products.json Layer 2 — Semantic resource schemas with Schema.org annotations
│   └── articles.json
├── actions.json      Layer 3 — Actions agents can take (queries + mutations)
└── digest.md         GEO layer — ~300-token AI-optimized summary
```

---

## Command Routing

### `/ara audit <url_or_path>`

Invoke the **ara-auditor** agent:

```
Agent: ara-auditor
Input: <url_or_path>
```

Returns a scored report (A-F) with breakdown, issues, warnings, and next steps.
Detects any existing `llms.txt` and recommends migration.

---

### `/ara transform <url_or_path> [--output <path>] [--layer <1|2|3>]`

**Phase 1:** Invoke **ara-auditor** first to understand current state:
- What files already exist
- What level the site is at
- Whether llms.txt is present
- Detected site type

**Phase 2:** Pass audit context to **ara-transformer**:
- Current ARA level (so transformer doesn't regenerate existing files)
- Detected site type
- llms.txt content if found
- List of missing files

**Phase 3:** Run validation directly:
```bash
npx ara-validate <url_or_path> 2>&1
```

Report final score and the files generated.

---

### `/ara migrate <url_or_path>`

For sites that have a `llms.txt` and want to upgrade to ARA.

**Phase 1:** Invoke **ara-auditor** with focus on llms.txt detection:
```
Agent: ara-auditor
Input: <url_or_path>
```
Extract the full llms.txt content from the audit report.

**Phase 2:** Invoke **ara-transformer** in migration mode:
```
Agent: ara-transformer
Input: <url_or_path> --migrate
Context: [llms.txt content from auditor]
```

The transformer maps all llms.txt sections into proper ARA structure.

After migration, explain to the user:
- What was migrated (section count, resource count)
- What was added beyond llms.txt (actions.json, schemas, policies)
- That llms.txt can be kept for backward compatibility or removed

---

### `/ara validate <url>`

No subagent needed — run directly:

```bash
npx ara-validate <url> 2>&1
```

Parse and display the result. If the tool is not installed, suggest:
```
npx ara-validate <url>
```

---

### `/ara geo <url_or_path>`

Focus on the GEO layer only. Invoke **ara-transformer** in GEO mode:

```
Agent: ara-transformer
Input: <url_or_path> --geo
```

This regenerates or creates `digest.md` and adds/updates `semantic` annotations in all
`schemas/*.json` files. It does not touch `manifest.json` or `actions.json`.

Use this when:
- The site already has ARA files but digest.md is thin or missing
- Schema.org `semantic` annotations are absent from schemas
- AI engines are not citing the site correctly

---

### `/ara quick <url>`

Fast 30-second snapshot. Invoke **ara-auditor** with minimal checks:

```
Agent: ara-auditor
Input: <url>
```

Ask the auditor to return only:
- ARA Level (0-4)
- Grade (A-F) and score
- Top 3 issues
- Whether llms.txt exists
- Recommended next command

---

### `/ara` (no arguments)

Show the quick reference table and the ARA overview below. Do not invoke any subagents.

---

## ARA vs llms.txt

| | llms.txt | ARA |
|--|---------|-----|
| Format | Plain text, markdown links | Structured JSON |
| Structure | Flat list of links | 3-layer architecture |
| Data schemas | None | JSON Schema + Schema.org |
| Actions | None | Full query/mutation definitions |
| Protocol support | None | REST, MCP, A2A, GraphQL |
| Access policies | None | Rate limits, auth, data usage |
| Agent token cost | ~800 tokens to parse | ~100 tokens for manifest |
| GEO layer | None | digest.md (AI-optimized) |
| Machine-readable | Partially | Fully |
| Migration path | — | `/ara migrate <url>` |

---

## ARA Adoption Levels

| Level | Files Present | Token Cost for Agent | Agent Capability |
|-------|--------------|---------------------|-----------------|
| 0 | Nothing | ~2000 (HTML parse) | Guess and scrape |
| 1 | manifest.json | ~150 | Understand site identity |
| 2 | + schemas/ | ~250 | Understand data structure |
| 3 | + actions.json | ~350 | Execute queries and mutations |
| 4 | + MCP/A2A | ~350 | Native LLM tool integration |

---

## Quality Gates

- Always run `ara-auditor` before `ara-transformer` when using `/ara transform` — never regenerate files blindly
- Never overwrite existing ARA files without reading them first
- Validation score must be B (80+) before reporting success; patch if below
- GEO: digest.md must be 200-400 tokens — flag if under 150 or over 500
- Respect robots.txt: if AI crawlers are blocked, flag this even if ARA files are perfect
- For mutations in actions.json, always set `confirmation_required: true`

---

## Examples

```bash
# New site — generate everything from scratch
/ara transform https://monsite.com

# Site with llms.txt — upgrade to ARA
/ara migrate https://monsite.com

# Check compliance before deploying
/ara audit https://monsite.com

# Already has ARA, improve GEO only
/ara geo https://monsite.com

# Quick check in 30 seconds
/ara quick https://monsite.com

# Local project (no live URL yet)
/ara transform ./my-project

# Generate manifest only (start small)
/ara transform https://monsite.com --layer 1
```

---

## Spec Reference

Full ARA specification:
- Layer 1 (manifest): `/Users/ali.khedji/Documents/ARA/ara-standard/spec/v1.0/manifest.md`
- Layer 2 (schemas): `/Users/ali.khedji/Documents/ARA/ara-standard/spec/v1.0/schemas.md`
- Layer 3 (actions): `/Users/ali.khedji/Documents/ARA/ara-standard/spec/v1.0/actions.md`

Example implementations:
- `/Users/ali.khedji/Documents/ARA/ara-standard/spec/examples/ecommerce/`
- `/Users/ali.khedji/Documents/ARA/ara-standard/spec/examples/saas/`
- `/Users/ali.khedji/Documents/ARA/ara-standard/spec/examples/media/`
- `/Users/ali.khedji/Documents/ARA/ara-standard/spec/examples/restaurant/`

CLI tools:
- `npx ara-validate <url>` — validate any site
- `npx ara-generate <url> --output .well-known/ara/` — generate baseline (enhanced by ara-transformer)
