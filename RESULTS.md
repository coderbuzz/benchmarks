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

> Results are best of 3 runs per benchmark.

### Ken — Static Value Handler

`app.get('/hello', { message: 'Hello, World' })` — inline JSON response (pre-compiled).

| Framework | Requests/sec |
|---|---|
| **Ken** | **262,405** |
| Elysia | 261,663 |
| Hono | 162,469 |
| Express | 96,892 |

### Ken — Validation POST

`POST /hello/:par1/:par2` — body + query + params + headers validation.

| Framework | Requests/sec |
|---|---|
| **Ken** | **123,856** |
| Elysia | 97,811 |
| Hono | 76,600 |
| Express | 50,829 |

### Kyo vs Zod / Yup / Joi — Validation Throughput

Simple object (name, age, active):

| Library | ops/s |
|---|---|
| **Kyo** | **24,750,686** |
| Zod | 4,129,736 |
| Joi | 1,545,601 |
| Yup | 311,045 |

Complex nested object with coercion:

| Library | ops/s |
|---|---|
| **Kyo** | **4,156,600** |
| Zod | 1,075,241 |
| Joi | 306,226 |
| Yup | 68,293 |

Error handling (invalid input):

| Library | ops/s |
|---|---|
| **Kyo** | **1,245,263** |
| Zod | 844,156 |
| Joi | 752,924 |
| Yup | 236,106 |

### Kyo vs Zod / Yup / Joi — Coercion Throughput

String → number, boolean, date, etc.

| Library | ops/s |
|---|---|
| **Kyo coerce()** | **11,633,204** |
| Zod coerce | 2,398,513 |
| Joi coerce | 659,241 |
| Yup coerce | 251,877 |

### Msgpack — Encode/Decode Throughput + Wire Size

Nested object encode:

| Library | ops/s |
|---|---|
| JSON.stringify | 5,061,391 |
| **msgpack encode** | **2,459,878** |
| @msgpack/msgpack | 1,190,036 |

Nested object decode:

| Library | ops/s |
|---|---|
| JSON.parse | 2,243,641 |
| **msgpack decode** | **1,074,505** |
| @msgpack/msgpack | 945,611 |

Wire size (smaller is better):

| Library | Bytes | Size |
|---|---|---|
| JSON | 178 | 0.17 KB |
| **msgpack** | **133** | **0.13 KB** (25% smaller vs JSON) |
| @msgpack/msgpack | 133 | 0.13 KB |

### KVS — In-Memory Throughput

Inline Map-based KV store operations:

| Operation | ops/s |
|---|---|
| set('k', 'v') | 6,138,798 |
| get() — hit | 34,509,533 |
| get() — miss | 136,783,375 |
| delete() | 24,999 |
| increment() | 27,760,743 |

### Proto — Encode/Decode Throughput + Wire Size

JSON-based proto-style codec vs msgpack:

| Encode | ops/s |
|---|---|
| JSON.stringify | 6,952,693 |
| **proto encode** | **3,974,629** |
| @coderbuzz/msgpack | 3,646,308 |
| @msgpack/msgpack | 1,464,844 |

| Decode | ops/s |
|---|---|
| JSON.parse | 3,468,298 |
| **proto decode** | **3,007,406** |
| @coderbuzz/msgpack | 1,439,044 |
| @msgpack/msgpack | 1,112,222 |

Wire size (smaller is better):

| Library | Bytes | Size |
|---|---|---|
| JSON | 139 | 0.14 KB |
| proto (JSON-based) | 139 | 0.14 KB |
| **@coderbuzz/msgpack** | **111** | **0.11 KB** (20% < JSON) |
| @msgpack/msgpack | 111 | 0.11 KB |
