# Benchmark Results

Results collected per environment. Each entry includes machine specs,
runtime versions, and test date.

---

## 2026-06-19 — Apple M-series, Bun 1.3.14

**Machine:** Apple Silicon (arm64)\
**Runtime:** Bun 1.3.14\
**Tool:** oha `-c 100 -z 10s`\
**Date:** 2026-06-19\
**Packages:** `@coderbuzz/ken@0.3.4`, `@coderbuzz/kyo@0.2.4`, `@coderbuzz/msgpack@0.1.4`

> Results are best of 2 runs per benchmark.

### Ken — Static Value Handler

`app.get('/hello', { message: 'Hello, World' })` — inline JSON response (pre-compiled).

| Framework | Requests/sec |
|---|---|
| **Ken** | **262,405** |
| Elysia | 261,663 |
| Hono | 162,469 |

### Ken — Dynamic Handler

`app.get('/hello', () => ({ message: 'Hello, World' }))` — function handler.

| Framework | Requests/sec |
|---|---|
| Elysia | 215,955 |
| **Ken** | **202,433** |
| Hono | 162,131 |

### Ken — Validation POST

`POST /hello/:par1/:par2` — body + query + params + headers validation.

| Framework | Requests/sec |
|---|---|
| **Ken** | **123,856** |
| Elysia | 97,811 |
| Hono | 76,627 |

### Kyo vs Zod — Validation Throughput

Simple object (name, age, active):

| Library | ops/s |
|---|---|
| **Kyo** | **20,845,458** |
| Zod | 4,243,957 |

Complex nested object with coercion:

| Library | ops/s |
|---|---|
| **Kyo** | **4,139,494** |
| Zod | 1,097,476 |

Error handling (invalid input):

| Library | ops/s |
|---|---|
| **Kyo** | **1,143,977** |
| Zod | 833,795 |

### Kyo — Coercion Throughput

String → number, boolean, date, etc.

| Library | ops/s |
|---|---|
| **Kyo coerce()** | **9,231,338** |
| Zod coerce | 2,340,267 |

### Msgpack — Encode/Decode Throughput

Nested object encode:

| Library | ops/s |
|---|---|
| JSON.stringify | 4,910,385 |
| **msgpack encode** | **2,197,150** |
| @msgpack/msgpack | 1,058,661 |

Nested object decode:

| Library | ops/s |
|---|---|
| JSON.parse | 2,221,313 |
| **msgpack decode** | **1,014,052** |
| @msgpack/msgpack | 899,407 |

### KVS — In-Memory Throughput

Inline Map-based KV store operations:

| Operation | ops/s |
|---|---|
| set('k', 'v') | 5,564,701 |
| get() — hit | 31,922,110 |
| get() — miss | 130,590,924 |
| delete() | 23,620 |
| increment() | 26,991,770 |

### Proto — Encode/Decode Throughput

JSON-based proto-style codec vs msgpack:

| Encode | ops/s |
|---|---|
| JSON.stringify | 6,766,205 |
| **proto encode** | **3,684,655** |
| @msgpack/msgpack | 1,365,584 |

| Decode | ops/s |
|---|---|
| JSON.parse | 3,386,377 |
| **proto decode** | **2,828,748** |
| @msgpack/msgpack | 1,085,579 |
