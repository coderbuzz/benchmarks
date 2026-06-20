#!/bin/bash
BOLD='\033[1m'
CYAN='\033[36m'
GREEN='\033[32m'
RESET='\033[0m'
SEP="${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

echo -e "$SEP"
echo -e "  ${BOLD}${CYAN}◈ KVS Server Transport Overhead Benchmark${RESET}"
echo -e "$SEP"
bun src/kvs-server/transport-overhead/bench.ts
echo ""
echo -e "${GREEN}✓ Complete${RESET}"
