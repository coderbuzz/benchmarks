#!/bin/bash
# Micro-benchmark (see src/_lib/harness.ts)
set -e
cd "$(dirname "$0")/../../.."
bun src/velox-ws-wire/wire-size/bench.ts
