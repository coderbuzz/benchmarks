# `@coderbuzz` Benchmarks

Public benchmark suite for [@coderbuzz](https://github.com/coderbuzz) packages.

## Latest Results (2026-06-19)

> Bun 1.3.14 · Apple Silicon · best of 2 runs

| Benchmark | Winner | Result |
|---|---|---|
| **Ken** Static Value | **Ken** | **262,405** req/s |
| **Ken** Dynamic Handler | Elysia | 215,955 req/s |
| **Ken** Validation POST | **Ken** | **123,856** req/s |
| **Kyo** vs Zod (simple) | **Kyo** | **20,845,458** ops/s (4.9× faster) |
| **Kyo** vs Zod (complex) | **Kyo** | **4,139,494** ops/s (3.8× faster) |
| **Kyo** Coercion | **Kyo** | **9,231,338** ops/s (3.9× faster) |
| **Msgpack** encode | JSON | 4,910,385 ops/s |
| **Msgpack** decode | JSON.parse | 2,221,313 ops/s |
| **KVS** get hit | — | 31,922,110 ops/s |
| **Proto** encode | JSON.stringify | 6,766,205 ops/s |

Full results in [RESULTS.md](./RESULTS.md).

## Methodology

| Parameter | Value |
|---|---|
| Tool | **oha** (default) or **wrk** (`WRK=1`) |
| Connections | 100 |
| Duration | 10 seconds |
| Machine | Apple Silicon M-series (specified per run) |

## Running Benchmarks

```sh
# Install deps
bun install

# Run specific benchmark
bash packages/ken/static-value/run.sh

# Run all
bash packages/ken/run-all.sh
```

## Packages

| Package | Benchmarks |
|---|---|
| [ken](./src/ken) | static-value, dynamic, validation |
| [kyo](./src/kyo) | vs-zod, coerce |
| [kvs](./src/kvs) | throughput |
| [msgpack](./src/msgpack) | throughput |
| [proto](./src/proto) | throughput |
