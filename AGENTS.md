# `@coderbuzz/benchmarks` — Agent Instructions

## Repo Goal

Benchmark `@coderbuzz/*` packages vs alternatives.

| Library | vs |
|---|---|
| `@coderbuzz/ken` (HTTP) | Elysia, Hono, Express |
| `@coderbuzz/kyo` (validation) | Zod, Yup, Joi |
| `@coderbuzz/msgpack` (codec) | JSON, `@msgpack/msgpack` |
| `@coderbuzz/kvs` (KV store) | — |
| `@coderbuzz/proto` (proto codec) | JSON, `@msgpack/msgpack` |

## Benchmark Types

| Type | Duration | Tool | Location |
|---|---|---|---|
| Ken HTTP | 10s/framework | `oha -c 100 -z 10s` | `src/ken/*/run.sh` |
| Throughput (Kyo/Zod/Msgpack/KVS/Proto) | ~50-500ms | `performance.now()` | `src/*/throughput/bench.ts` |

## Running

```sh
bun install
bash src/ken/static-value/run.sh   # single
bash src/ken/run-all.sh            # all ken
```

Output: ANSI-colored. Run directly in terminal, not piped.

## Methodology

- **3 runs per benchmark**, take best result. Warmup matters — variance up to 8%.
- **HTTP:** 100 conn, 10s, oha.
- **Throughput:** 50k-100k iters after 1k warmup.
- **Machine:** Apple Silicon, Bun 1.3.x.

## Git Workflow

**MANDATORY — branch → PR → main:**

1. Create branch from `main` before any changes.
2. Naming: `feat/<fitur>` or `fix/<bug>`.
3. After done: push branch, create PR to `main`.
4. NEVER commit directly to `main` (exception: README typo fix).
5. If accidentally committed to `main`: branch from that commit, reset `main` to previous, proceed via PR.
6. After PR merged: delete branch (local + remote). Do NOT reuse.

## Session Memory Logs

- Location: `memory/<YYYY-MM-DD>_<topic>.md`
- Content: what was done, decisions, key files.
- Purpose: carry context between sessions, audit trail.
- Flat structure — no subfolders.
- Reference previous: `@memory/<filename>`.

## Results Architecture

**Dua target audience — dua format:**

| Format | Untuk | Lokasi |
|---|---|---|
| Markdown tables | Manusia (README) | `README.md` |
| JSON structured | Agentic AI | `results/latest.json` |

### `results/latest.json`

- Source of truth untuk AI agent di monorepo terpisah.
- Fetch via raw URL: `https://raw.githubusercontent.com/coderbuzz/benchmarks/main/results/latest.json`
- Setiap entry punya: `winner: bool`, `factorVsNext`, `higherIsBetter`, `code` field.
- Agent langsung tahu juara dan seberapa jauh tanpa perlu parse tabel.
- Historical: `results/<YYYY-MM-DD>.json`

### `README.md`

- Human-friendly summary via markdown tables.
- Setiap tabel disertai code snippet yang di-benchmark.
- TIDAK untuk AI parse — arahkan AI ke `results/latest.json`.

### Contoh konsumsi oleh AI agent

```ts
const res = await fetch(
  'https://raw.githubusercontent.com/coderbuzz/benchmarks/main/results/latest.json'
)
const data = await res.json()
const suite = data.suites.find(s => s.id === 'kyo-simple')
const winner = suite.entries.find(e => e.winner)
console.log(`${winner.name}: ${winner.value} ops/s`)
```

## File Structure

```
memory/                    # session logs
results/                   # JSON results (latest.json + historical dates)
src/
├── ken/
│   ├── static-value/       # GET /hello inline
│   │   └── server-{ken,elysia,hono,express}.ts
│   └── validation/         # POST /hello/:par1/:par2 (body+query+params+headers)
│       └── server-{ken,elysia,hono,express}.ts
├── kyo/
│   ├── vs-zod/bench.ts     # simple/complex/error validation throughput
│   └── coerce/bench.ts     # string→number/boolean/date coercion
├── kvs/throughput/bench.ts # set/get/delete/increment
├── msgpack/throughput/bench.ts # encode/decode + wire size
└── proto/throughput/bench.ts   # encode/decode + wire size
```
