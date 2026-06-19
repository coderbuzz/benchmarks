# SESSION: 2026-06-19 — Benchmark Refinement

## DONE

### Dependencies
- `@coderbuzz/ken` 0.3.1 → 0.3.4
- `@coderbuzz/kyo` 0.2.1 → 0.2.4
- `@coderbuzz/msgpack` 0.1.1 → 0.1.4
- Add: `express@5`, `yup`, `joi`, `@types/express`, `@types/bun`, `@types/node`

### Fixes
- `src/ken/validation/server-ken.ts`: validation import from `@coderbuzz/ken` → `@coderbuzz/kyo`
- tsconfig: add `"types": ["bun", "node"]`, install `@types/bun` `@types/node`

### Benchmarks
- REMOVE `dynamic` benchmark (run-all.sh, package.json)
- ADD Express to static-value & validation (validation uses Zod)
- ADD Yup & Joi to kyo/vs-zod/bench.ts and kyo/coerce/bench.ts
- ADD `@coderbuzz/msgpack` to proto benchmark
- UPGRADE wire size output → ASCII table with ANSI colors
- ALL run.sh + bench.ts: ANSI colors (cyan, bold, green ✓)

### Methodology Change
- Runs: 2× → **3× per benchmark**, take best result
- Variance HTTP ±4-8%, throughput ±2-5% → 3× worthwhile

### Docs Created/Updated
- `AGENTS.md` — repo context for agents
- `README.md` — summary table per package (all frameworks + winner column)
- `RESULTS.md` — full data
- `memory/` — this session

## RESULTS (best of 3)

### Ken (req/s)
| Benchmark | Ken | Elysia | Hono | Express |
|---|---|---|---|---|
| Static Value | **262,405** | 261,663 | 162,469 | 96,892 |
| Validation | **123,856** | 97,811 | 76,600 | 50,829 |

### Kyo (ops/s)
| Benchmark | Kyo | Zod | Joi | Yup |
|---|---|---|---|---|
| Simple | **24,750,686** | 4,129,736 | 1,545,601 | 311,045 |
| Complex | **4,156,600** | 1,075,241 | 306,226 | 68,293 |
| Error | **1,245,263** | 844,156 | 752,924 | 236,106 |
| Coercion | **11,633,204** | 2,398,513 | 659,241 | 251,877 |

### Msgpack (ops/s)
| Library | Encode | Decode | Wire |
|---|---|---|---|
| JSON | 5,061,391 | 2,243,641 | 178B |
| **@coderbuzz/msgpack** | **2,459,878** | **1,074,505** | **133B** (25% < JSON) |
| @msgpack/msgpack | 1,190,036 | 945,611 | 133B |

### Proto (ops/s)
| Library | Encode | Decode | Wire |
|---|---|---|---|
| JSON | 6,952,693 | 3,468,298 | 139B |
| proto | 3,974,629 | 3,007,406 | 139B |
| **@coderbuzz/msgpack** | **3,646,308** | **1,439,044** | **111B** |
| @msgpack/msgpack | 1,464,844 | 1,112,222 | 111B |

### KVS (ops/s)
set: 6.1M | get hit: 34.5M | get miss: 136.8M | delete: 25K | increment: 27.8M

## DECISIONS

- Express validation uses Zod (Express has no built-in validation)
- `@coderbuzz/msgpack` encode: 2.5× faster than `@msgpack/msgpack`, decode: 1.3× faster, wire size identical
- Kyo: 6× Zod, 16× Joi, 80× Yup for simple validation

## STRUCTURE (at session end)

```
.
├── AGENTS.md
├── memory/
├── README.md
├── RESULTS.md
├── src/
│   ├── ken/{static-value,validation}/
│   ├── kyo/{vs-zod,coerce}/
│   ├── kvs/throughput/
│   ├── msgpack/throughput/
│   └── proto/throughput/
├── package.json
└── tsconfig.json
```
