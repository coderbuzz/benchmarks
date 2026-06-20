# `@coderbuzz/benchmarks` — Agent Instructions

Benchmark `@coderbuzz/*` packages vs alternatives. Bun runtime, Apple Silicon.

## RUN COMMANDS

```
bun install
bun run velox:static                      # single via npm script
bash src/velox/static-value/run.sh        # same, using oha directly
bash src/velox/run-all.sh                 # all velox (static + validation only, NOT dynamic)
WRK=1 bash src/velox/static-value/run.sh  # use wrk instead of oha
```

Output is ANSI-colored. Run directly in terminal — do NOT pipe.

`oha` is NOT in `package.json` — must be pre-installed. `WRK=1` env var switches to `wrk`.

## PostgreSQL dependency

AsyncKVStore PostgreSQL benchmark needs a running PG instance.
System has **OrbStack** (Docker runtime). Start if needed:

```bash
docker run -d --rm --name pg_sql_test \
  -p 5432:5432 \
  -e POSTGRES_USER=testuser \
  -e POSTGRES_PASSWORD=testpw \
  -e POSTGRES_DB=sql_test \
  postgres:16-alpine
```

Wait until ready (`pg_isready -U testuser`).
Benchmark auto-skips PG if unavailable.

## BENCHMARKS

| Sub-benchmark | Cmd | Tool | Notes |
|---|---|---|---|
| Velox static-value | `bun run velox:static` | `oha -c 100 -z 10s` | GET /hello, inline JSON, 4 frameworks |
| Velox validation | `bun run velox:validation` | `oha -c 100 -z 10s` | POST /hello/:par1/:par2, 4 frameworks |
| Velox dynamic | `bash src/velox/dynamic/run.sh` | `oha -c 100 -z 10s` | GET /hello, callback fn, 4 frameworks. NOT in run-all or npm scripts |
| Veta vs-zod | `bun run veta:vs-zod` | `bun bench.ts` | simple/complex/error, 4 libs |
| Veta coerce | `bun run veta:coerce` | `bun bench.ts` | string→number/boolean/date |
| KVS throughput | `bun run kvs:throughput` | `bun bench.ts` | set/get/delete/increment |
| KVS async-throughput | `bun run kvs:async-throughput` | `bun bench.ts` | set/get/delete/increment, 3 backends: sync SQLite, async SQLite, async PostgreSQL |
| Msgpack throughput | `bun run msgpack:throughput` | `bun bench.ts` | encode/decode + wire size |
| Proto throughput | `bun run proto:throughput` | `bun bench.ts` | encode/decode + wire size |

All npm scripts: `bun run velox:static`, `velox:validation`, `veta:vs-zod`, `veta:coerce`, `kvs:throughput`, `kvs:async-throughput`, `msgpack:throughput`, `proto:throughput`.

## METHODOLOGY (MANDATORY)

- 3 runs per benchmark, take best result.
- Variance up to 8% between runs. Warmup matters.
- HTTP: `oha -c 100 -z 10s`. Throughput: 50k–100k iterations after 1k warmup (`performance.now()`).
- Machine: Apple Silicon, Bun 1.3.x.

## RESULTS

Two formats, two audiences:

| Format | Audience | Location |
|---|---|---|
| JSON | AI agents | `results/latest.json` |
| Markdown | humans | `README.md` |

- AI agents MUST read `results/latest.json`. DO NOT parse the README for data.
- After any README.md edit, VALIDATE markdown tables: header columns count must match separator dashes count. Run `grep -n '^|' README.md | head -30` and manually verify column alignment.
- Every JSON entry includes: `winner: bool`, `factorVsNext`, `higherIsBetter`, `code`.
- Historical: `results/<YYYY-MM-DD>.json`.
- Consumption pattern: `fetch('https://raw.githubusercontent.com/coderbuzz/benchmarks/main/results/latest.json')` → `data.suites.find(s => s.id === 'veta-simple').entries.find(e => e.winner)`.

## GIT WORKFLOW (MANDATORY)

1. CREATE BRANCH from `main` before any change.
2. NAME: `feat/<fitur>` or `fix/<bug>`.
3. After done: PUSH → PR to `main`.
4. NEVER commit to `main`. Exception: README typo fix only.
5. If you accidentally commit to `main`: branch from that commit, reset `main` to previous, then proceed via PR.
6. After PR merged: DELETE branch (local + remote). DO NOT REUSE.

## FILE LAYOUT

```
results/                   # JSON (latest.json + dated historical)
src/
├── velox/
│   ├── static-value/       # GET /hello inline (pre-compiled route)
│   ├── validation/         # POST /hello/:par1/:par2 with validation
│   └── dynamic/            # GET /hello callback fn — 4 frameworks, NOT in run-all
├── veta/
│   ├── vs-zod/bench.ts     # simple/complex/error validation
│   └── coerce/bench.ts     # string→number/boolean/date
├── kvs/throughput/bench.ts # set/get/delete/increment
├── kvs/async-throughput/bench.ts # set/get/delete/increment (SQLite sync/async + PG async)
├── msgpack/throughput/bench.ts # encode/decode + wire size
└── proto/throughput/bench.ts   # encode/decode + wire size
```
