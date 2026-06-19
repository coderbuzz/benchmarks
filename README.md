# `@coderbuzz` Benchmarks

Public benchmark suite for [@coderbuzz](https://github.com/coderbuzz) packages.

**For AI agents:** Machine-readable results at [`results/latest.json`](./results/latest.json)
([raw](https://raw.githubusercontent.com/coderbuzz/benchmarks/main/results/latest.json)).

## Latest Results (2026-06-19)

> Bun 1.3.14 · Apple Silicon · best of 3 runs

### Ken

| Benchmark | Ken | Elysia | Hono | Express | Winner |
|---|---|---|---|---|---|
| Static Value | **262,405** | 261,663 | 162,469 | 96,892 | **Ken** |
| Validation POST | **123,856** | 97,811 | 76,600 | 50,829 | **Ken** |

*req/s — higher is better*

### Kyo

| Benchmark | Kyo | Zod | Joi | Yup | Winner |
|---|---|---|---|---|---|
| Simple validation | **24,750,686** | 4,129,736 | 1,545,601 | 311,045 | **Kyo** (6.0× vs Zod) |
| Complex validation | **4,156,600** | 1,075,241 | 306,226 | 68,293 | **Kyo** (3.9× vs Zod) |
| Error handling | **1,245,263** | 844,156 | 752,924 | 236,106 | **Kyo** (1.5× vs Zod) |
| Coercion | **11,633,204** | 2,398,513 | 659,241 | 251,877 | **Kyo** (4.9× vs Zod) |

*ops/s — higher is better*

### Msgpack

| Benchmark | @coderbuzz/msgpack | JSON | @msgpack/msgpack | Winner |
|---|---|---|---|---|
| Encode (ops/s) | **2,459,878** | 5,061,391 | 1,190,036 | JSON.stringify |
| Decode (ops/s) | **1,074,505** | 2,243,641 | 945,611 | JSON.parse |
| Wire size | **133 B** | 178 B | 133 B | **msgpack** (25% < JSON) |

*ops/s higher is better, wire size smaller is better*

### KVS

| Operation | ops/s |
|---|---|
| set('k', 'v') | 6,138,798 |
| get() — hit | 34,509,533 |
| get() — miss | 136,783,375 |
| delete() | 24,999 |
| increment() | 27,760,743 |

### Proto

| Benchmark | proto | @coderbuzz/msgpack | JSON | @msgpack/msgpack | Winner |
|---|---|---|---|---|---|
| Encode (ops/s) | **3,974,629** | 3,646,308 | 6,952,693 | 1,464,844 | JSON.stringify |
| Decode (ops/s) | **3,007,406** | 1,439,044 | 3,468,298 | 1,112,222 | JSON.parse |
| Wire size | 139 B | **111 B** | 139 B | 111 B | msgpack libs (20% < JSON/proto) |

*ops/s higher is better, wire size smaller is better*

## Code Snippets

What each benchmark actually measures:

### Ken — HTTP frameworks

```ts
// @coderbuzz/ken — GET /hello
import { AppServer } from "@coderbuzz/ken";
const app = new AppServer({ port: 3000 });
app.get("/hello", { message: "Hello, World" });
app.run();

// Elysia — GET /hello
import { Elysia } from "elysia";
new Elysia().get("/hello", () => ({ message: "Hello, World" })).listen(3000);

// Express — GET /hello
import express from "express";
express().get("/hello", (_, res) => res.json({ message: "Hello, World" })).listen(3000);

// Hono — GET /hello
import { Hono } from "hono";
new Hono().get("/hello", (c) => c.json({ message: "Hello, World" }));
```

```ts
// @coderbuzz/ken — POST /hello/:par1/:par2 with validation
app.post("/hello/:par1/:par2", {
  json: object({
    someKey: optional(string()),
    requiredKey: array(number(), { max: 3 }),
    enumKey: union([literal("John"), literal("Foo")]),
  }),
  query: { name: optional(string()) },
  params: { par1: optional(string()), par2: optional(coerce(number())) },
  headers: { "x-foo": string() },
}, async (ctx) => {
  await ctx.json;
  return Response.json({ message: "Hello, World" });
});

// Elysia — POST /hello/:par1/:par2 with validation (built-in TypeBox)
import { Elysia, t } from "elysia";
new Elysia().post("/hello/:par1/:par2", () => ({ message: "Hello, World" }), {
  body: t.Object({ someKey: t.Optional(t.String()), requiredKey: t.Array(t.Integer(), { maxItems: 3 }) }),
  query: t.Object({ name: t.Optional(t.String()) }),
  params: t.Object({ par1: t.Optional(t.String()), par2: t.Optional(t.Number()) }),
  headers: t.Object({ "x-foo": t.String() }),
}).listen(3000);

// Hono — POST /hello/:par1/:par2 with validation (TypeBox via @hono/typebox-validator)
import { Hono } from "hono";
import { tbValidator } from "@hono/typebox-validator";
import { Type as t } from "@sinclair/typebox";
const app = new Hono();
app.post("/hello/:par1/:par2",
  tbValidator("json", bodySchema),
  tbValidator("query", querySchema),
  tbValidator("param", paramsSchema),
  tbValidator("header", headersSchema),
  (c) => c.json({ message: "Hello, World" }),
);

// Express — POST /hello/:par1/:par2 with validation (Zod)
import express from "express";
import { z } from "zod";
express().post("/hello/:par1/:par2", (req, res) => {
  bodySchema.parse(req.body);
  querySchema.parse(req.query);
  paramsSchema.parse(req.params);
  headersSchema.parse(req.headers);
  res.json({ message: "Hello, World" });
});
```

### Kyo — Validation libraries

```ts
// @coderbuzz/kyo — simple validation
object({ name: string({ min: 2, max: 100 }), age: number({ min: 0, max: 150 }), active: boolean() })

// Zod — simple validation
z.object({ name: z.string().min(2).max(100), age: z.number().min(0).max(150), active: z.boolean() })

// Joi — simple validation
Joi.object({ name: Joi.string().min(2).max(100).required(), age: Joi.number().min(0).max(150).required(), active: Joi.boolean().required() })

// Yup — simple validation
yup.object({ name: yup.string().min(2).max(100).required(), age: yup.number().min(0).max(150).required(), active: yup.boolean().required() })
```

```ts
// @coderbuzz/kyo — coercion
object({ id: coerce(number()), active: coerce(boolean()), label: coerce(string()), born: coerce(date()) })

// Zod — coercion
z.object({ id: z.coerce.number(), active: z.coerce.boolean(), label: z.coerce.string(), born: z.coerce.date() })
```

### Msgpack — Codec libraries

```ts
// @coderbuzz/msgpack
import { encode, decode } from "@coderbuzz/msgpack";
const buf = encode(obj);
const val = decode(buf);

// JSON
const buf = JSON.stringify(obj);
const val = JSON.parse(json);

// @msgpack/msgpack
import { encode, decode } from "@msgpack/msgpack";
const buf = encode(obj);
const val = decode(buf);
```

### KVS — In-memory KV store

```ts
class KVStore {
  private store = new Map<string, { value: any; expires: number }>();
  set(key: string, value: any, opts?: { ttl?: number }) { /* ... */ }
  get(key: string): any { /* ... */ }
  delete(key: string): boolean { /* ... */ }
  increment(key: string, by = 1): number { /* ... */ }
}
```

### Proto — Proto-style codec

```ts
class ProtoCodec {
  static encode(obj: any) { return Buffer.from(JSON.stringify(obj)); }
  static decode(buf: Buffer) { return JSON.parse(buf.toString()); }
}
```

## Methodology

| Parameter | Value |
|---|---|
| Tool | **oha** (default) or **wrk** (`WRK=1`) |
| Connections | 100 |
| Duration | 10 seconds |
| Runs per benchmark | 3 (best result taken) |
| Machine | Apple Silicon M-series (specified per run) |

## Running Benchmarks

```sh
# Install deps
bun install

# Run specific benchmark
bash src/ken/static-value/run.sh

# Run all ken benchmarks
bash src/ken/run-all.sh
```

## Packages

| Package | Benchmarks |
|---|---|
| [ken](./src/ken) | static-value, validation |
| [kyo](./src/kyo) | vs-zod, coerce |
| [kvs](./src/kvs) | throughput |
| [msgpack](./src/msgpack) | throughput |
| [proto](./src/proto) | throughput |
