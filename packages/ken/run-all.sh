#!/bin/bash
set -e

echo "═══ Ken Benchmark Suite ═══"
echo ""

bash packages/ken/static-value/run.sh
echo ""
bash packages/ken/dynamic/run.sh
echo ""
bash packages/ken/validation/run.sh

echo ""
echo "═══ Ken Benchmark Suite Complete ═══"
