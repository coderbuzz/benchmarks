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

| Benchmark | Kyo | Zod | Joi | Yup | Winner |
|---|---|---|---|---|---|
| Simple validation | **24,750,686** | 4,129,736 | 1,545,601 | 311,045 | **Kyo** (6.0× vs Zod) |
| Complex validation | **4,156,600** | 1,075,241 | 306,226 | 68,293 | **Kyo** (3.9× vs Zod) |
| Error handling | **1,245,263** | 844,156 | 752,924 | 236,106 | **Kyo** (1.5× vs Zod) |
| Coercion | **11,633,204** | 2,398,513 | 659,241 | 251,877 | **Kyo** (4.9× vs Zod) |

*ops/s — higher is better*

### Msgpack

| Benchmark | @coderbuzz/msgpack | JSON | @msgpack/msgpack | Winner |
|---|---|---|---|---|
| Encode (ops/s) | **2,459,878** | 5,061,391 | 1,190,036 | JSON.stringify |
| Decode (ops/s) | **1,074,505** | 2,243,641 | 945,611 | JSON.parse |
| Wire size | **133 B** | 178 B | 133 B | **msgpack** (25% < JSON) |

*ops/s higher is better, wire size smaller is better*

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
| Encode (ops/s) | **3,894,132** | 7,170,472 | 1,301,376 | JSON.stringify |
| Decode (ops/s) | **3,071,701** | 3,619,986 | 1,131,733 | JSON.parse |
| Wire size | 139 B | 139 B | **111 B** | **@msgpack/msgpack** (20% < proto) |

*ops/s higher is better, wire size smaller is better*

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
