# Sesi: Benchmark Refinement — 2026-06-19

## Ringkasan

Refactor total benchmark suite `@coderbuzz/benchmarks`: update tools, fix bugs, tambah library, reformat output, rerun 3×.

## Perubahan

### Package Updates
- `@coderbuzz/ken` 0.3.1 → 0.3.4
- `@coderbuzz/kyo` 0.2.1 → 0.2.4
- `@coderbuzz/msgpack` 0.1.1 → 0.1.4
- Install baru: `express@5`, `yup`, `joi`, `@types/express`, `@types/bun`, `@types/node`

### Fixes
- `src/ken/validation/server-ken.ts`: import validasi dari `@coderbuzz/ken` → `@coderbuzz/kyo`
- TypeScript: tambah `@types/bun`, `@types/node`, update `tsconfig.json` dgn `"types": ["bun", "node"]`

### Ken Benchmarks
- **Hapus** `dynamic` benchmark (ken/run-all.sh, package.json scripts)
- **Tambah** Express ke static-value & validation:
  - `src/ken/static-value/server-express.ts`
  - `src/ken/validation/server-express.ts` (pake Zod)
- 4 framework sekarang: Ken, Elysia, Hono, Express

### Kyo Benchmarks
- **Tambah** Yup & Joi ke `vs-zod/bench.ts` dan `coerce/bench.ts`
- 4 library: Kyo, Zod, Yup, Joi

### Msgpack / Proto
- **Tambah** `@coderbuzz/msgpack` ke proto benchmark
- **Upgrade** wire size output pake tabel ASCII

### Output Reformating
- Semua `run.sh` + `bench.ts` pake ANSI color (cyan, bold, green ✓)

### Methodology
- Runs: 2× → **3× per benchmark**, ambil best result
- Variance HTTP ±4-8%, throughput ±2-5% — 3× worthwhile

### Dokumentasi
- `AGENTS.md` — context lengkap repo
- `memory/sesi-2026-06-19-benchmark-refinement.md` — sesi ini
- `README.md` — summary table per package (all frameworks + winner column)
- `RESULTS.md` — full data

## Hasil Benchmark (best of 3)

### Ken (req/s)
| Benchmark | Ken | Elysia | Hono | Express |
|---|---|---|---|---|
| Static Value | **262,405** | 261,663 | 162,469 | 96,892 |
| Validation POST | **123,856** | 97,811 | 76,600 | 50,829 |

### Kyo (ops/s)
| Benchmark | Kyo | Zod | Joi | Yup |
|---|---|---|---|---|
| Simple | **24,750,686** | 4,129,736 | 1,545,601 | 311,045 |
| Complex | **4,156,600** | 1,075,241 | 306,226 | 68,293 |
| Error | **1,245,263** | 844,156 | 752,924 | 236,106 |
| Coercion | **11,633,204** | 2,398,513 | 659,241 | 251,877 |

### Msgpack — Encode (ops/s)
| Library | ops/s | Wire |
|---|---|---|
| JSON.stringify | 5,061,391 | 178B |
| **@coderbuzz/msgpack** | **2,459,878** | **133B** (25% < JSON) |
| @msgpack/msgpack | 1,190,036 | 133B |

### Msgpack — Decode (ops/s)
| Library | ops/s |
|---|---|
| JSON.parse | 2,243,641 |
| **@coderbuzz/msgpack** | **1,074,505** |
| @msgpack/msgpack | 945,611 |

### Proto — Encode/Decode (ops/s)
| Library | Encode | Decode | Wire |
|---|---|---|---|
| JSON.stringify/parse | 6,952,693 | 3,468,298 | 139B |
| proto | 3,974,629 | 3,007,406 | 139B |
| **@coderbuzz/msgpack** | **3,646,308** | **1,439,044** | **111B** |
| @msgpack/msgpack | 1,464,844 | 1,112,222 | 111B |

### KVS (ops/s)
set: 6.1M | get hit: 34.5M | get miss: 136.8M | delete: 25K | increment: 27.8M

## Struktur File

```
.
├── AGENTS.md              # context repo (utk agentic AI)
├── memory/
│   └── sesi-2026-06-19-*  # sesi ini
├── README.md              # summary + cara run
├── RESULTS.md             # full data
├── src/
│   ├── ken/
│   │   ├── static-value/
│   │   │   ├── run.sh, server-{ken,elysia,hono,express}.ts
│   │   └── validation/
│   │       ├── run.sh, server-{ken,elysia,hono,express}.ts
│   ├── kyo/
│   │   ├── vs-zod/bench.ts, run.sh  (Kyo, Zod, Yup, Joi)
│   │   └── coerce/bench.ts, run.sh
│   ├── kvs/throughput/
│   ├── msgpack/throughput/
│   └── proto/throughput/
└── package.json, tsconfig.json
```

## Catatan

- Express validation pake Zod (karena express ga punya built-in validation)
- @coderbuzz/msgpack ~2.5× faster encode & ~1.3× faster decode vs @msgpack/msgpack, wire size identik
- Kyo outperform semua library validasi: 6× Zod, 16× Joi, 80× Yup (simple case)
