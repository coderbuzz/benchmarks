# `@coderbuzz` Benchmarks

Public benchmark suite for [@coderbuzz](https://github.com/coderbuzz) packages.

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
