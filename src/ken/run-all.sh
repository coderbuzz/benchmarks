#!/bin/bash
set -e
echo "═══ Ken Benchmark Suite ═══"
bash src/ken/static-value/run.sh
bash src/ken/dynamic/run.sh
bash src/ken/validation/run.sh
echo "═══ Done ═══"
