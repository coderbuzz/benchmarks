#!/bin/bash
# Runs every benchmark, then rebuilds results/latest.json and the README tables.
set -e
cd "$(dirname "$0")/.."
bash src/velox/run-all.sh
for b in veta/vs veta/coerce msgpack/throughput proto/throughput kvs/throughput \
         velox-ws-wire/throughput velox-ws-wire/wire-size sql/compile kvs-server/transport-overhead; do
  # Separate processes, best per entry kept (BENCH_MERGE): see AGENTS.md, Methodology.
  for p in $(seq 1 "${BENCH_PROCESSES:-3}"); do
    echo ""
    BENCH_MERGE=$((p > 1)) bash "src/$b/run.sh"
  done
done
echo ""
bun scripts/build-results.ts
