#!/bin/bash
# All Velox HTTP benchmarks: static value, dynamic handler, validation.
set -e
cd "$(dirname "$0")/../.."
for scenario in static-value dynamic validation; do
  bun src/velox/http-bench.ts "$scenario"
  echo ""
done
