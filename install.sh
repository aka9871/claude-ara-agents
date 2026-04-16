#!/usr/bin/env bash
# ARA Claude Code Agents — Installer
# Installs ara-auditor, ara-transformer agents and the /ara skill into Claude Code.
#
# Usage:
#   ./install.sh
#   curl -fsSL https://raw.githubusercontent.com/ARA-Standard/claude-ara-agents/main/install.sh | bash

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
AGENTS_DIR="$CLAUDE_DIR/agents"
SKILLS_DIR="$CLAUDE_DIR/skills/ara"

# ── Colors ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()    { echo -e "${BLUE}[ARA]${NC} $1"; }
success() { echo -e "${GREEN}[ARA]${NC} $1"; }
warn()    { echo -e "${YELLOW}[ARA]${NC} $1"; }

# ── Header ───────────────────────────────────────────────────────────────────
echo ""
echo "  ARA Claude Code Agents"
echo "  ─────────────────────────────────────"
echo "  Makes any website AI-agent-ready"
echo ""

# ── Check Claude Code ────────────────────────────────────────────────────────
if [ ! -d "$CLAUDE_DIR" ]; then
  warn "~/.claude directory not found."
  warn "Please install Claude Code first: https://claude.ai/code"
  exit 1
fi

# ── Create directories ───────────────────────────────────────────────────────
info "Creating directories..."
mkdir -p "$AGENTS_DIR"
mkdir -p "$SKILLS_DIR"

# ── Install agents ───────────────────────────────────────────────────────────
info "Installing ara-auditor agent..."
cp "$REPO_DIR/agents/ara-auditor.md" "$AGENTS_DIR/ara-auditor.md"
success "  ~/.claude/agents/ara-auditor.md"

info "Installing ara-transformer agent..."
cp "$REPO_DIR/agents/ara-transformer.md" "$AGENTS_DIR/ara-transformer.md"
success "  ~/.claude/agents/ara-transformer.md"

# ── Install skill ────────────────────────────────────────────────────────────
info "Installing /ara skill..."
cp "$REPO_DIR/skills/ara/SKILL.md" "$SKILLS_DIR/SKILL.md"
success "  ~/.claude/skills/ara/SKILL.md"

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "  Installation complete."
echo ""
echo "  Usage:"
echo "    /ara audit https://yoursite.com       Score A-F, detect gaps"
echo "    /ara transform https://yoursite.com   Generate all ARA files"
echo "    /ara migrate https://yoursite.com     Convert llms.txt to ARA"
echo "    /ara quick https://yoursite.com       30-second snapshot"
echo ""
echo "  Spec: https://ara-standard.org"
echo ""
