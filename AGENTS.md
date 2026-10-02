# `@coderbuzz/benchmarks`: Agent Instructions

Benchmark `@coderbuzz/*` packages vs alternatives. Bun runtime.

**Reference machine:** the Claude Code cloud environment, Linux x64, Intel Xeon @ 2.10GHz, 4 cores.
Every published result comes from this machine so runs stay comparable. Do not publish results from a
laptop or another host; run them there for local checks only.

## Run commands

```
bun install
bun run bench:all                         # everything + rebuild results/latest.json and README tables
bun run velox:static                      # single benchmark → results/raw/<name>.json
bash src/velox/static-value/run.sh        # same
bash src/velox/run-all.sh                 # all velox HTTP: static-value, dynamic, validation
WRK=1 bash src/velox/static-value/run.sh  # use wrk instead of oha
bun run results:build                     # results/raw/*.json → latest.json, <date>.json, README tables
bun run typecheck
```

Output is ANSI-colored, so run it directly in a terminal rather than through a pipe.

`oha` is not in `package.json`; install it first (see below). The `WRK=1` env var switches to `wrk`.
`bun.lock` is committed: results must be reproducible against exact versions.

## Cloud environment setup

The container does not ship everything the benchmarks need. Before `bun run bench:all`:

```bash
# Bun: the image's bun may be older than the version in results. Install the target version
# next to it and put it first on PATH (do not overwrite ~/.bun/bin/bun).
npm i -g bun@1.4.2
export PATH="$(npm prefix -g)/bin:$PATH"   # bun --version → 1.4.2

# oha (HTTP load generator), built from crates.io, ~3 min
cargo install oha --locked

# PostgreSQL 16 is installed but stopped. Start it and create the bench user + database once.
service postgresql start
su postgres -c "psql -c \"CREATE USER testuser WITH PASSWORD 'testpw' SUPERUSER;\" -c \"CREATE DATABASE sql_test OWNER testuser;\""
pg_isready
```

The KVS benchmark skips PostgreSQL when it is not reachable, so check that its output has the
`Async PostgreSQL` section before publishing.

## Benchmarks

| Sub-benchmark | Cmd | Raw file | Notes |
|---|---|---|---|
| Velox static-value | `bun run velox:static` | `velox-static-value` | GET /hello, inline JSON, 4 frameworks |
| Velox dynamic | `bun run velox:dynamic` | `velox-dynamic` | GET /hello, handler fn, 4 frameworks |
| Velox validation | `bun run velox:validation` | `velox-validation` | POST /hello/:par1/:par2, 4 frameworks |
| Veta vs | `bun run veta:vs` | `veta-vs` | simple/complex/error, 5 libs |
| Veta coerce | `bun run veta:coerce` | `veta-coerce` | string→number/boolean/date |
| KVS throughput | `bun run kvs:throughput` | `kvs` | set/get/delete/increment × bun:sqlite, async SQLite, async PostgreSQL |
| Msgpack throughput | `bun run msgpack:throughput` | `msgpack` | encode/decode + wire size |
| Proto throughput | `bun run proto:throughput` | `proto` | encode/decode + wire size |
| WS wire throughput | `bun run velox-ws-wire:throughput` | `velox-ws-wire-throughput` | per frame type, wire vs JSON |
| WS wire size | `bun run velox-ws-wire:wire-size` | `velox-ws-wire-size` | per frame type |
| SQL compile | `bun run sql:compile` | `sql-compile` | @coderbuzz/sql vs Kysely vs Drizzle |
| KVS server | `bun run kvs-server:transport-overhead` | `kvs-server` | direct vs WS RPC vs HTTP REST |

## Methodology (required)

- HTTP (`src/velox/http-bench.ts`): `oha -c 100`, 3 s warmup, 3 × 10 s runs, best taken. `NODE_ENV=production`.
  Before load, each server must answer `200 {"message":"Hello, World"}` and (validation) reject invalid input.
  Any non-2xx during a run fails it.
- Micro-benchmarks (`src/_lib/harness.ts`): 1k warmup calls, iterations calibrated to ~300 ms per round,
  3 rounds, best taken. Results go to a sink (no dead-code elimination). Each file runs sanity checks first.
- Every bench input that a library might mutate (TypeBox `Convert`) is a fresh object per call, for all libs.
- New benchmarks: use the harness, record suites with `Recorder`, add the raw file name to `FILES` in
  `scripts/build-results.ts` (and a `GROUPS` layout if it is a new README table).
- Measured variance on the reference machine (two full runs, 2026-10-02, Bun 1.4.2): single 10 s HTTP runs
  spread up to 10.1%; the reported best-of-3 figure moved up to 8.1% between the two runs. Micro-benchmark
  variance is not measured (the harness reports only the best round). Re-measure after a Bun or machine change.

## Results

Two formats, two audiences, one source (`results/raw/*.json`, gitignored):

| Format | Audience | Location |
|---|---|---|
| JSON | AI agents | `results/latest.json` (+ `results/<YYYY-MM-DD>.json`) |
| Markdown | humans | `README.md` block between `<!-- results:start -->` / `<!-- results:end -->` |

- `bun run results:build` generates both. NEVER hand-edit numbers in either.
- AI agents read `results/latest.json`. Do not parse the README for data.
- After any manual README.md edit outside the generated block, validate the markdown tables: the header
  column count must match the separator count (`grep -n '^|' README.md`).
- `meta.schemaVersion: 2`. Every suite has `id`, `group`, `row`, `code`, `unit`, `higherIsBetter`; every entry
  has `winner`, `factorVsNext` (`null` for last), `factorVsBest`. In HTTP suites every entry within
  `meta.http.tieThreshold` (0.1) of the best is a winner, since smaller gaps are run-to-run noise; in other suites
  only the best value wins.
- Suites compare like with like: one suite per operation (e.g. `kvs-set`, `velox-ws-wire-ping-encode`).
- Consumption pattern: `fetch('https://raw.githubusercontent.com/coderbuzz/benchmarks/main/results/latest.json')` → `data.suites.find(s => s.id === 'veta-simple').entries.find(e => e.winner)`.

## Git workflow (required)

1. Create a branch from `main` before any change.
2. Name it `feat/<feature>` or `fix/<bug>`.
3. When done, push and open a PR to `main`.
4. NEVER commit to `main`. Exception: README typo fix only.
5. If you accidentally commit to `main`: branch from that commit, reset `main` to previous, then proceed via PR.
6. After the PR is merged, delete the branch (local and remote). Do not reuse it.

## File layout

```
results/                   # latest.json + dated historical; raw/ is gitignored scratch
scripts/
├── build-results.ts       # raw → latest.json, <date>.json, README tables
└── run-all.sh             # bun run bench:all
src/
├── _lib/harness.ts        # bench/benchAsync, sanity checks, Recorder
├── velox/
│   ├── http-bench.ts       # HTTP runner (oha/wrk) for the three scenarios
│   ├── static-value/       # GET /hello inline (pre-compiled route)
│   ├── dynamic/            # GET /hello callback fn
│   └── validation/         # POST /hello/:par1/:par2 with validation
├── veta/{vs,coerce}/bench.ts
├── kvs/throughput/bench.ts
├── kvs-server/transport-overhead/bench.ts
├── msgpack/throughput/bench.ts
├── proto/throughput/bench.ts
├── sql/compile/bench.ts
└── velox-ws-wire/{frames.ts,throughput,wire-size}
```
