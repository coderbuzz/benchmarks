#!/bin/bash
set -e
BOLD='\033[1m'
CYAN='\033[36m'
GREEN='\033[32m'
RESET='\033[0m'
SEP="${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

echo -e "$SEP"
echo -e "  ${BOLD}${CYAN}⚡ Ken Benchmark Suite${RESET}"
echo -e "$SEP"
echo ""
bash src/ken/static-value/run.sh
echo ""
bash src/ken/validation/run.sh
echo ""
echo -e "${GREEN}✓ All Ken benchmarks complete${RESET}"
