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

## Results

- Summary: `README.md`
- Full data: `RESULTS.md`

## File Structure

```
memory/                    # session logs
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
