# `@coderbuzz/benchmarks` — Agent Context

## Repo Objective

This repo benchmarks `@coderbuzz/*` packages against popular alternatives.

Our libraries under test:
- **`@coderbuzz/ken`** — HTTP framework → vs Elysia, Hono, Express
- **`@coderbuzz/kyo`** — Validation/coercion library → vs Zod
- **`@coderbuzz/msgpack`** — msgpack codec → vs JSON, `@msgpack/msgpack`
- **`@coderbuzz/kvs`** — KV store (inline impl) → standalone throughput
- **`@coderbuzz/proto`** — Proto codec (inline impl) → vs JSON, `@msgpack/msgpack`

## Benchmark Types

| Type | Duration | Tool | Location |
|---|---|---|---|
| Ken HTTP | 10s per framework | `oha -c 100 -z 10s` | `src/ken/*/run.sh` |
| Kyo/Zod/Msgpack/KVS/Proto | ~50ms-500ms | Bun `performance.now()` | `src/*/throughput/bench.ts` |

## Running Benchmarks

```sh
bun install
bash src/ken/static-value/run.sh   # single benchmark
bash src/ken/run-all.sh            # all ken benchmarks
```

All `run.sh` and `bench.ts` use ANSI-colored output (run directly in terminal, not piped).

## Methodology

- **Runs:** 3 per benchmark, take best result (warmup matters — variance up to 8% between runs)
- **HTTP:** 100 connections, 10s duration, oha tool
- **Throughput:** 50k-100k iterations after 1k warmup iterations
- **Machine:** Apple Silicon, Bun 1.3.x

## Results

- Summary: `README.md`
- Full data: `RESULTS.md`

## File Structure

```
src/
├── ken/
│   ├── static-value/       # app.get('/hello', { message }) — inline response
│   │   ├── run.sh
│   │   ├── server-ken.ts
│   │   ├── server-elysia.ts
│   │   ├── server-hono.ts
│   │   └── server-express.ts
│   └── validation/         # POST /hello/:par1/:par2 — body+query+params+headers
│       ├── run.sh
│       ├── server-ken.ts
│       ├── server-elysia.ts
│       ├── server-hono.ts
│       └── server-express.ts
├── kyo/
│   ├── vs-zod/bench.ts     # simple, complex, error validation throughput
│   └── coerce/bench.ts     # string→number/boolean/date coercion throughput
├── kvs/throughput/bench.ts # Map-based KV: set/get/delete/increment
├── msgpack/throughput/bench.ts # encode/decode + wire size
└── proto/throughput/bench.ts   # encode/decode + wire size
```
