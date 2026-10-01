#!/bin/bash
# Micro-benchmark (see src/_lib/harness.ts)
set -e
cd "$(dirname "$0")/../../.."
bun src/kvs-server/transport-overhead/bench.ts
