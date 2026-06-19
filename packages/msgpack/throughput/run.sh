#!/bin/bash
echo "══════════════════════════════════════"
echo "  Msgpack Throughput Benchmark"
echo "══════════════════════════════════════"

bun packages/msgpack/throughput/bench.ts
