# `@coderbuzz` Benchmarks

Public benchmark suite for [@coderbuzz](https://github.com/coderbuzz) packages.

## Latest Results (2026-06-19)

> Bun 1.3.14 · Apple Silicon · best of 3 runs

### Ken

| Benchmark | Ken | Elysia | Hono | Express | Winner |
|---|---|---|---|---|---|
| Static Value | **262,405** | 261,663 | 162,469 | 96,892 | **Ken** |
| Validation POST | **123,856** | 97,811 | 76,600 | 50,829 | **Ken** |

*req/s — higher is better*

### Kyo

| Benchmark | Kyo | Zod | Winner |
|---|---|---|---|
| Simple validation | **21,984,463** | 4,201,784 | **Kyo** (5.2×) |
| Complex validation | **4,113,569** | 1,086,786 | **Kyo** (3.8×) |
| Error handling | **1,261,926** | 898,671 | **Kyo** (1.4×) |
| Coercion | **11,106,585** | 2,634,711 | **Kyo** (4.2×) |

*ops/s — higher is better*

### Msgpack

| Benchmark | @coderbuzz/msgpack | JSON | @msgpack/msgpack | Winner |
|---|---|---|---|---|
| Encode | **2,307,821** | 4,755,903 | 1,091,452 | JSON.stringify |
| Decode | **1,021,225** | 2,140,025 | 889,274 | JSON.parse |

*ops/s — higher is better*

### KVS

| Operation | ops/s |
|---|---|
| set('k', 'v') | 6,138,798 |
| get() — hit | 34,509,533 |
| get() — miss | 136,783,375 |
| delete() | 24,999 |
| increment() | 27,760,743 |

### Proto

| Benchmark | proto | JSON | @msgpack/msgpack | Winner |
|---|---|---|---|---|
| Encode | **3,709,061** | 6,772,811 | 1,382,390 | JSON.stringify |
| Decode | **3,089,495** | 3,560,017 | 1,101,646 | JSON.parse |

*ops/s — higher is better*

Full results in [RESULTS.md](./RESULTS.md).

## Methodology

| Parameter | Value |
|---|---|
| Tool | **oha** (default) or **wrk** (`WRK=1`) |
| Connections | 100 |
| Duration | 10 seconds |
| Runs per benchmark | 3 (best result taken) |
| Machine | Apple Silicon M-series (specified per run) |

## Running Benchmarks

```sh
# Install deps
bun install

# Run specific benchmark
bash src/ken/static-value/run.sh

# Run all ken benchmarks
bash src/ken/run-all.sh
```

## Packages

| Package | Benchmarks |
|---|---|
| [ken](./src/ken) | static-value, validation |
| [kyo](./src/kyo) | vs-zod, coerce |
| [kvs](./src/kvs) | throughput |
| [msgpack](./src/msgpack) | throughput |
| [proto](./src/proto) | throughput |
