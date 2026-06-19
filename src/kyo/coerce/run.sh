#!/bin/bash
echo "══════════════════════════════════════"
echo "  Coercion Benchmark"
echo "  Kyo coerce() vs Zod coerce"
echo "══════════════════════════════════════"
bun src/kyo/coerce/bench.ts
