#!/bin/bash
# Runs every benchmark, then rebuilds results/latest.json and the README tables.
set -e
cd "$(dirname "$0")/.."
bash src/velox/run-all.sh
for b in veta/vs veta/coerce msgpack/throughput proto/throughput kvs/throughput \
         velox-ws-wire/throughput velox-ws-wire/wire-size sql/compile kvs-server/transport-overhead; do
  echo ""
  bash "src/$b/run.sh"
done
echo ""
bun scripts/build-results.ts
