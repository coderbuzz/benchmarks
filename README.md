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
| [ken](./packages/ken) | static-value, dynamic, validation |
| [kyo](./packages/kyo) | vs-zod, coerce |
| [kvs](./packages/kvs) | throughput |
| [msgpack](./packages/msgpack) | throughput |
| [proto](./packages/proto) | throughput |
