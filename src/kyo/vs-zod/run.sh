#!/bin/bash
BOLD='\033[1m'
CYAN='\033[36m'
GREEN='\033[32m'
RESET='\033[0m'
SEP="${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

echo -e "$SEP"
echo -e "  ${BOLD}${CYAN}◈ Kyo vs Zod Benchmark${RESET}"
echo -e "$SEP"
bun src/kyo/vs-zod/bench.ts
echo ""
echo -e "${GREEN}✓ Complete${RESET}"
