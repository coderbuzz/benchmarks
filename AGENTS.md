# `@coderbuzz/benchmarks`: Agent Instructions

Benchmark `@coderbuzz/*` packages vs alternatives. Bun runtime.

**Machine:** a published run may come from any machine (owner decision, 2026-10-10), for example a Claude Code
cloud session or the dev VM. What makes it publishable is the record, not the host: one full `bench:all` on one
machine, with PostgreSQL on that same machine, and the machine written to `meta.machine` and the README header
(CPU name, family/model/stepping, cores, OS and arch). The PR names the machine too. Never mix groups from
different runs.

Compare absolute numbers across runs only when `meta.machine` matches. Winners can move with the CPU, not only with
the code: on 2026-10-10 velox-ws-wire subscribe/publish encode went to JSON on two cloud Xeons (2.10GHz model 207,
2.80GHz model 85) and to Wire on the dev VM (Platinum 8255C @ 2.50GHz model 85, about 2x slower on HTTP). Cloud
sessions do not always land on the same CPU; the model name alone does not tell them apart (the same "Xeon @
2.10GHz" label read 13% apart), so family/model/stepping is recorded.

On a shared machine (the dev VM runs other agent sessions), start only when it is quiet: `uptime` load average
below 0.5 and no build, test or other benchmark running (`ps -eo pcpu,comm --sort=-pcpu | head`). Re-run if the
load rose during it.

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

## Machine setup (dev VM)

```bash
# Bun at the version the results should be on, first on PATH
bun --version

# oha (HTTP load generator)
oha --version          # install: cargo install oha --locked

# PostgreSQL 16 for the KVS benchmark, in Docker, with the bench user and database
docker run -d --name pg_bench -e POSTGRES_USER=testuser -e POSTGRES_PASSWORD=testpw -e POSTGRES_DB=sql_test \
  -p 5432:5432 postgres:16-alpine
docker exec pg_bench pg_isready -U testuser     # stop afterwards: docker rm -f pg_bench
```

Claude Code cloud sessions prepare the same tools through the SessionStart hook
(`.claude/hooks/session-start.sh`; bump `BUN_VERSION` there when moving to a new Bun).

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
  Every `bench()`/`benchAsync()` gets its own timing loop, built with `new Function` from a source unique to
  that bench. Until 2026-10-10 one loop served a whole file: its call site saw every closure, and its JIT state
  after the earlier sections set the result (identical code read 65M to 509M ops/s between processes; the
  veta Check row's winner was close to random). Identical source would share compiled code, so keep it unique.
- A pure, non-allocating call on a constant input can be hoisted out of a monomorphic loop. Give such rows
  inputs that change per call (the veta Simple and Check rows alternate two valid objects via `i & 1`), the
  same for every library in the suite.
  `bench:all` runs each micro-benchmark in `BENCH_PROCESSES` (default 3) separate processes and keeps the best
  value per entry (`BENCH_MERGE=1` merges into the saved raw file). Rounds alone are not enough: some cases are
  bimodal per process, fixed at warmup. On the dev VM (2026-10-09), five `veta:vs` processes with
  unchanged code read Veta `is()` at 44M or 66-74M ops/s and TypeBox `Check` at 64-68M or 120-146M. Most of that was
  the shared timing loop (fixed 2026-10-10, below); with one loop per bench three processes read 102.0-102.5M
  and 78.9-81.7M. Keep the separate processes anyway.
  A single `bun run <bench>` is one process; for a publishable figure use the `bench:all` loop.
- No suite for an operation with no work in it: `encodePing()` returns a pre-built buffer, so PING has a decode
  and a wire-size row but no encode row.
- Every bench input that a library might mutate (TypeBox `Convert`) is a fresh object per call, for all libs.
- New benchmarks: use the harness, record suites with `Recorder`, add the raw file name to `FILES` in
  `scripts/build-results.ts` (and a `GROUPS` layout if it is a new README table).
- Measured variance on a cloud machine, 2.10GHz CPU (two full runs, 2026-10-02, Bun 1.4.2): single 10 s HTTP runs
  spread up to 10.1%; the reported best-of-3 figure moved up to 8.1% between the two runs. Micro-benchmarks
  vary more: `@coderbuzz/msgpack` encode read 1.34M to 1.84M ops/s across five runs that day (27%), with
  unchanged code. Re-measure after a Bun or machine change.

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
- Suites compare like with like: one suite per operation (e.g. `kvs-set`, `velox-ws-wire-publish-encode`).
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
