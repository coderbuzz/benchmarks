#!/bin/bash
set -e
BOLD='\033[1m'
CYAN='\033[36m'
GREEN='\033[32m'
RESET='\033[0m'
SEP="${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

echo -e "$SEP"
echo -e "  ${BOLD}${CYAN}⚡ Velox Benchmark Suite${RESET}"
echo -e "$SEP"
echo ""
bash src/velox/static-value/run.sh
echo ""
bash src/velox/validation/run.sh
echo ""
echo -e "${GREEN}✓ All Velox benchmarks complete${RESET}"
