#!/bin/bash
echo "══════════════════════════════════════"
echo "  Coercion Benchmark"
echo "  Kyo coerce() vs Zod coerce"
echo "══════════════════════════════════════"

bun packages/kyo/coerce/bench.ts
