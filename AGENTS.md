# `@coderbuzz/benchmarks` — Agent Instructions

## REPO MISSION

Benchmark `@coderbuzz/*` packages vs alternatives.

| Library | vs |
|---|---|
| `@coderbuzz/ken` | Elysia, Hono, Express |
| `@coderbuzz/kyo` | Zod, Yup, Joi |
| `@coderbuzz/msgpack` | JSON, `@msgpack/msgpack` |
| `@coderbuzz/kvs` | — |
| `@coderbuzz/proto` | JSON, `@msgpack/msgpack` |

## BENCHMARK TYPES

| Type | Duration | Tool | Location |
|---|---|---|---|
| Ken HTTP | 10s/framework | `oha -c 100 -z 10s` | `src/ken/*/run.sh` |
| Throughput | ~50-500ms | `performance.now()` | `src/*/throughput/bench.ts` |

## RUN COMMANDS

```
bun install
bash src/ken/static-value/run.sh   # single
bash src/ken/run-all.sh            # all ken
```

Output is ANSI-colored. Run directly in terminal — do NOT pipe.

## METHODOLOGY (MANDATORY)

- 3 runs per benchmark, take best result.
- Variance up to 8% between runs. Warmup matters.
- HTTP: 100 connections, 10s, oha.
- Throughput: 50k-100k iterations after 1k warmup.
- Machine: Apple Silicon, Bun 1.3.x.

## GIT WORKFLOW (MANDATORY)

1. CREATE BRANCH from `main` before any change.
2. NAME: `feat/<fitur>` or `fix/<bug>`.
3. After done: PUSH → PR to `main`.
4. NEVER commit to `main`. Exception: README typo fix only.
5. If you accidentally commit to `main`: branch from that commit, reset `main` to previous, then proceed via PR.
6. After PR merged: DELETE branch (local + remote). DO NOT REUSE.

## RESULTS ARCHITECTURE

Two formats, two audiences:

| Format | Audience | Location |
|---|---|---|
| JSON | AI AGENTS | `results/latest.json` |
| Markdown | HUMANS | `README.md` |

### `results/latest.json` — FOR AI AGENTS

- This is the source of truth for AI in other repos.
- FETCH via: `https://raw.githubusercontent.com/coderbuzz/benchmarks/main/results/latest.json`
- Every entry includes: `winner: bool`, `factorVsNext`, `higherIsBetter`, `code`.
- Agent knows winner AND gap without parsing tables.
- Historical: `results/<YYYY-MM-DD>.json`.

Consumption pattern:

```ts
const res = await fetch('https://raw.githubusercontent.com/coderbuzz/benchmarks/main/results/latest.json')
const data = await res.json()
const suite = data.suites.find(s => s.id === 'kyo-simple')
const winner = suite.entries.find(e => e.winner)
// => winner.name, winner.value, winner.factorVsNext
```

### `README.md` — NOT FOR AI

- Human-readable markdown tables + code snippets.
- DO NOT parse for data. Use `results/latest.json` instead.
- DIRECT other AI agents to `results/latest.json`.

## FILE LAYOUT

```
results/                   # JSON (latest.json + dated historical)
src/
├── ken/
│   ├── static-value/       # GET /hello inline
│   │   └── server-{ken,elysia,hono,express}.ts
│   └── validation/         # POST /hello/:par1/:par2
│       └── server-{ken,elysia,hono,express}.ts
├── kyo/
│   ├── vs-zod/bench.ts     # simple/complex/error validation
│   └── coerce/bench.ts     # string→number/boolean/date
├── kvs/throughput/bench.ts # set/get/delete/increment
├── msgpack/throughput/bench.ts # encode/decode + wire size
└── proto/throughput/bench.ts   # encode/decode + wire size
```
