# `@coderbuzz` Benchmarks

Public benchmark suite for [@coderbuzz](https://github.com/coderbuzz) packages.

**For AI agents:** Machine-readable results at [`results/latest.json`](./results/latest.json)
([raw](https://raw.githubusercontent.com/coderbuzz/benchmarks/main/results/latest.json)).

## Latest Results (2026-06-20)

> Bun 1.3.14 · Apple Silicon · best of 3 runs

### Velox

| Benchmark | Velox | Elysia | Hono | Express | Winner |
|---|---|---|---|---|---|
| Static Value | **269,388** | 262,685 | 170,044 | 100,762 | **Velox** |
| Validation POST | **119,058** | 94,776 | 74,657 | 48,652 | **Velox** |

*req/s — higher is better*

### Veta

| Benchmark | Veta | Zod | Joi | Yup | Winner |
|---|---|---|---|---|---|
| Simple validation | **20,523,522** | 2,796,538 | 1,319,125 | 302,015 | **Veta** (7.3× vs Zod) |
| Complex validation | **3,221,615** | 924,793 | 302,983 | 62,882 | **Veta** (3.5× vs Zod) |
| Error handling | **1,238,328** | 833,937 | 764,122 | 217,887 | **Veta** (1.5× vs Zod) |
| Coercion | **10,239,083** | 2,157,284 | 660,375 | 235,123 | **Veta** (4.7× vs Zod) |

*ops/s — higher is better*

### Msgpack

| Benchmark | @coderbuzz/msgpack | JSON | @msgpack/msgpack | Winner |
|---|---|---|---|---|
| Encode (ops/s) | **2,037,237** | 4,781,239 | 767,220 | JSON.stringify |
| Decode (ops/s) | **897,973** | 1,959,513 | 865,251 | JSON.parse |
| Wire size | **133 B** | 178 B | 133 B | **msgpack** (25% < JSON) |

*ops/s higher is better, wire size smaller is better*

### KVS

| Operation | ops/s |
|---|---|
| set('k', 'v') | 198,720 |
| get() — hit | 1,156,635 |
| get() — miss | 1,931,481 |
| delete() | 1,689,546 |
| increment() | 138,163 |

### Proto

| Benchmark | proto | @coderbuzz/msgpack | JSON | @msgpack/msgpack | Winner |
|---|---|---|---|---|---|
| Encode (ops/s) | **4,694,891** | 3,275,386 | 6,892,630 | 1,323,117 | JSON.stringify |
| Decode (ops/s) | **3,109,557** | 1,231,876 | 3,320,669 | 1,086,271 | JSON.parse |
| Wire size | **65 B** | 111 B | 139 B | 111 B | **proto** (53% < JSON) |

*ops/s higher is better, wire size smaller is better*

## Code Snippets

What each benchmark actually measures:

### Velox — HTTP frameworks

```ts
// @coderbuzz/velox — GET /hello
import { AppServer } from "@coderbuzz/velox";
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
// @coderbuzz/velox — POST /hello/:par1/:par2 with validation
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

### Veta — Validation libraries

```ts
// @coderbuzz/veta — simple validation
object({ name: string({ min: 2, max: 100 }), age: number({ min: 0, max: 150 }), active: boolean() })

// Zod — simple validation
z.object({ name: z.string().min(2).max(100), age: z.number().min(0).max(150), active: z.boolean() })

// Joi — simple validation
Joi.object({ name: Joi.string().min(2).max(100).required(), age: Joi.number().min(0).max(150).required(), active: Joi.boolean().required() })

// Yup — simple validation
yup.object({ name: yup.string().min(2).max(100).required(), age: yup.number().min(0).max(150).required(), active: yup.boolean().required() })
```

```ts
// @coderbuzz/veta — coercion
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

### KVS — SQLite-backed KV store

```ts
import { KVStore } from "@coderbuzz/kvs";

const kv = new KVStore("kv.db");
kv.set(["users", "alice"], { name: "Alice", plan: "pro" });  // 215K ops/s
const entry = kv.get(["users", "alice"]);                      // 1.2M ops/s
kv.delete(["users", "alice"]);                                 // 1.6M ops/s
```

### Proto — Binary codec

```ts
import { object, string, number, boolean, array } from "@coderbuzz/veta";
import { proto } from "@coderbuzz/proto";

const schema = object({
  id: number(), name: string(), active: boolean(),
  tags: array(string()),
  metadata: object({ createdAt: string(), score: number() }),
});
const codec = proto(schema);

const bytes = codec.encode(obj);   // 65B — 53% < JSON
const val = codec.decode(bytes);   // 2.6M ops/s
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
bash src/velox/static-value/run.sh

# Run all velox benchmarks
bash src/velox/run-all.sh
```

## Packages

| Package | Benchmarks |
|---|---|
| [velox](./src/velox) | static-value, validation |
| [veta](./src/veta) | vs-zod, coerce |
| [kvs](./src/kvs) | throughput |
| [msgpack](./src/msgpack) | throughput |
| [proto](./src/proto) | throughput |
