#!/bin/bash
BOLD='\033[1m'
DIM='\033[2m'
CYAN='\033[36m'
GREEN='\033[32m'
RESET='\033[0m'
SEP="${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

echo -e "$SEP"
echo -e "  ${BOLD}${CYAN}◈ KVS Throughput Benchmark${RESET}"
echo -e "$SEP"
bun src/kvs/throughput/bench.ts
echo ""
echo -e "${GREEN}✓ Complete${RESET}"
