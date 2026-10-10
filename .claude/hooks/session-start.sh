#!/bin/bash
# SessionStart hook for Claude Code cloud sessions: prepares the reference machine so
# `bun run bench:all` works (see AGENTS.md, "Cloud environment setup"). Idempotent.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

BUN_VERSION="1.4.3"
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# Bun: install the target version as a global npm package (the image's ~/.bun/bin/bun may be
# older) and put npm's global bin first on PATH, for this script and for the session.
NPM_BIN="$(npm prefix -g)/bin"
if [ "$("$NPM_BIN/bun" --version 2>/dev/null || true)" != "$BUN_VERSION" ]; then
  npm i -g "bun@$BUN_VERSION" >/dev/null
fi
export PATH="$NPM_BIN:$PATH"
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PATH=\"$NPM_BIN:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi

# oha (HTTP load generator): built once from crates.io (~3 min), then kept in the cached image.
if ! command -v oha >/dev/null 2>&1; then
  cargo install oha --locked
fi

# PostgreSQL 16 for the KVS benchmark: start it, then create the bench user and database once.
service postgresql start >/dev/null
for _ in $(seq 1 30); do pg_isready -q && break; sleep 1; done
if ! su postgres -c "psql -tAc \"SELECT 1 FROM pg_roles WHERE rolname = 'testuser'\"" | grep -q 1; then
  su postgres -c "psql -qc \"CREATE USER testuser WITH PASSWORD 'testpw' SUPERUSER;\""
fi
if ! su postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname = 'sql_test'\"" | grep -q 1; then
  su postgres -c "psql -qc \"CREATE DATABASE sql_test OWNER testuser;\""
fi

bun install

echo "benchmarks env ready: bun $(bun --version), $(oha --version), $(pg_isready)"
