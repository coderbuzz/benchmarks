# Benchmark Results

Results collected per environment. Each entry includes machine specs,
runtime versions, and test date.

---

## 2026-06-19 — Apple M-series, Bun 1.3.14

**Machine:** Apple Silicon (arm64)\
**Runtime:** Bun 1.3.14\
**Tool:** oha `-c 100 -z 10s`\
**Date:** 2026-06-19

### Ken — Static Value Handler

`app.get('/hello', { message: 'Hello, World' })` — inline JSON response (pre-compiled).

| Framework | Requests/sec |
|---|---|
| Elysia | 256,207 |
| **Ken** | **251,420** |
| Hono | 158,830 |

### Ken — Dynamic Handler

`app.get('/hello', () => ({ message: 'Hello, World' }))` — function handler.

| Framework | Requests/sec |
|---|---|
| Elysia | 213,088 |
| **Ken** | **203,352** |
| Hono | 157,462 |

### Ken — Validation POST

`POST /hello/:par1/:par2` — body + query + params + headers validation.

| Framework | Requests/sec |
|---|---|
| Elysia | TBD |
| **Ken** | **TBD** |
| Hono | TBD |

### Kyo vs Zod — Validation Throughput

Simple object (name, age, active):

| Library | ops/s |
|---|---|
| **Kyo** | **10,099,225** |
| Zod | 3,348,579 |

Complex nested object with coercion:

| Library | ops/s |
|---|---|
| **Kyo** | **4,581,578** |
| Zod | 1,032,662 |

Error handling (invalid input):

| Library | ops/s |
|---|---|
| **Kyo** | **1,144,318** |
| Zod | 845,090 |

### Kyo — Coercion Throughput

String → number, boolean, date, etc.

| Library | ops/s |
|---|---|
| **Kyo coerce()** | **9,899,602** |
| Zod coerce | 2,436,741 |

### Msgpack — Encode/Decode Throughput

Nested object encode:

| Library | ops/s |
|---|---|
| JSON.stringify | 4,704,923 |
| **msgpack encode** | **2,306,978** |
| @msgpack/msgpack | 1,110,872 |

Nested object decode:

| Library | ops/s |
|---|---|
| JSON.parse | 2,164,077 |
| **msgpack decode** | **982,727** |
| @msgpack/msgpack | 892,077 |

### KVS — In-Memory Throughput

Inline Map-based KV store operations:

| Operation | ops/s |
|---|---|
| set('k', 'v') | 4,700,343 |
| get() — hit | 33,961,623 |
| get() — miss | 83,062,273 |
| delete() | 21,374 |
| increment() | 26,622,892 |

### Proto — Encode/Decode Throughput

JSON-based proto-style codec vs msgpack:

| Encode | ops/s |
|---|---|
| JSON.stringify | 5,954,035 |
| proto encode | 3,798,550 |
| @msgpack/msgpack | 1,391,758 |

| Decode | ops/s |
|---|---|
| JSON.parse | 3,546,277 |
| proto decode | 2,966,090 |
| @msgpack/msgpack | 1,062,393 |

