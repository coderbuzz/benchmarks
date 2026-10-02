# `@coderbuzz` Benchmarks

Public benchmark suite for [@coderbuzz](https://github.com/coderbuzz) packages.

**For AI agents:** Machine-readable results at [`results/latest.json`](./results/latest.json)
([raw](https://raw.githubusercontent.com/coderbuzz/benchmarks/main/results/latest.json)).

<!-- results:start -->
## Latest Results (2026-10-02)

> Bun 1.4.2 · Intel(R) Xeon(R) Processor @ 2.10GHz, 4 cores, linux (x64) · generated from [`results/latest.json`](./results/latest.json) by `bun scripts/build-results.ts`

### Velox

| Benchmark | @coderbuzz/velox | Elysia | Hono | Express | Winner |
|---|---|---|---|---|---|
| Static value | 143,833 | **148,019** | 78,497 | 35,111 | **Elysia** (1.03× vs velox) |
| Dynamic handler | 82,989 | **95,272** | 78,599 | 38,031 | **Elysia** (1.15× vs velox) |
| Validation POST | 40,294 | **41,861** | 35,598 | 18,607 | **Elysia** (1.04× vs velox) |

*req/s — higher is better. `oha -c 100`, 3 s warmup, best of 3 × 10 s runs. Static value: Velox/Elysia use a static route value, Hono/Express a handler.*

---

### Veta

| Benchmark | @coderbuzz/veta | Zod | Yup | Joi | TypeBox | Winner |
|---|---|---|---|---|---|---|
| Simple validation | 19,873,240 | 4,877,990 | 141,554 | 823,523 | **264,840,346** | **TypeBox** (13.33× vs veta) |
| Complex validation | **2,012,848** | 1,192,435 | 30,854 | 143,859 | 104,392 | **veta** (1.69× vs Zod) |
| Error handling | **548,240** | 423,130 | 123,581 | 396,022 | 292,370 | **veta** (1.30× vs Zod) |
| Coercion | 3,352,701 | **6,671,086** | 122,309 | 473,675 | 50,936 | **Zod** (1.99× vs veta) |

*ops/s — higher is better. TypeBox uses the compiled validator (`Compile(schema)`).*

---

### Msgpack

| Benchmark | @coderbuzz/msgpack | JSON | @msgpack/msgpack | Winner |
|---|---|---|---|---|
| Encode (ops/s) | 1,843,655 | **4,010,274** | 303,536 | **JSON** (2.17× vs msgpack) |
| Decode (ops/s) | 792,185 | **1,788,743** | 441,020 | **JSON** (2.26× vs msgpack) |
| Wire size (bytes) | **133 B** | 178 B | **133 B** | **msgpack = @msgpack/msgpack** (25% < JSON) |

*ops/s higher is better, wire size smaller is better.*

---

### Proto

| Benchmark | @coderbuzz/proto | @coderbuzz/msgpack | JSON | @msgpack/msgpack | Winner |
|---|---|---|---|---|---|
| Encode (ops/s) | 3,250,010 | 2,472,029 | **6,763,252** | 422,503 | **JSON** (2.08× vs proto) |
| Decode (ops/s) | 1,194,782 | 1,027,578 | **4,027,397** | 604,865 | **JSON** (3.37× vs proto) |
| Wire size (bytes) | **65 B** | 111 B | 139 B | 111 B | **proto** (41% < msgpack) |

*ops/s higher is better, wire size smaller is better.*

---

### KVS

| Benchmark | bun:sqlite | Async SQLite | Async PostgreSQL |
|---|---|---|---|
| set('k', 'v') | 505,001 | 68,479 | 4,489 |
| get() — hit | 987,856 | 83,540 | 13,357 |
| get() — miss | 1,600,717 | 92,435 | 15,803 |
| delete() | 637,634 | 116,772 | 3,777 |
| increment() | 163,753 | 25,466 | 2,663 |

*ops/s — higher is better. Sequential, one caller. PostgreSQL runs on the same machine. `increment()` is the store's atomic built-in.*

---

### Velox WS Wire

| Benchmark | @coderbuzz/velox-ws-wire | JSON | Winner |
|---|---|---|---|
| PING encode | **2,922,073,976** | 15,712,848 | **velox-ws-wire** (185.97× vs JSON) |
| PING decode | **59,602,834** | 13,763,257 | **velox-ws-wire** (4.33× vs JSON) |
| PUBLISH encode | 5,275,369 | **7,155,569** | **JSON** (1.36× vs velox-ws-wire) |
| PUBLISH decode | **3,841,812** | 3,566,514 | **velox-ws-wire** (1.08× vs JSON) |
| REQUEST encode | 6,908,574 | **7,210,823** | **JSON** (1.04× vs velox-ws-wire) |
| REQUEST decode | **6,354,584** | 3,569,569 | **velox-ws-wire** (1.78× vs JSON) |
| RESPONSE encode | 7,687,559 | **8,059,591** | **JSON** (1.05× vs velox-ws-wire) |
| RESPONSE decode | **6,818,096** | 4,447,934 | **velox-ws-wire** (1.53× vs JSON) |
| SUBSCRIBE encode | 9,737,224 | **10,734,537** | **JSON** (1.10× vs velox-ws-wire) |
| SUBSCRIBE decode | 6,275,248 | **8,509,636** | **JSON** (1.36× vs velox-ws-wire) |

*ops/s — higher is better. `encodePing()` returns a shared pre-built buffer, so PING encode measures call overhead only.*

---

### Velox WS Wire — size

| Benchmark | @coderbuzz/velox-ws-wire | JSON | Winner |
|---|---|---|---|
| PING | **1 B** | 15 B | **velox-ws-wire** (93% < JSON) |
| PUBLISH | **44 B** | 92 B | **velox-ws-wire** (52% < JSON) |
| REQUEST | **37 B** | 83 B | **velox-ws-wire** (55% < JSON) |
| RESPONSE | **37 B** | 84 B | **velox-ws-wire** (56% < JSON) |
| SUBSCRIBE | **12 B** | 41 B | **velox-ws-wire** (71% < JSON) |

*bytes — smaller is better.*

---

### SQL

| Benchmark | @coderbuzz/sql | Kysely | Drizzle ORM | Winner |
|---|---|---|---|---|
| SELECT simple | **813,931** | 448,557 | 35,520 | **sql** (1.81× vs Kysely) |
| SELECT JOIN | **482,598** | 262,740 | 16,325 | **sql** (1.84× vs Kysely) |
| INSERT single | **1,448,095** | 251,186 | 45,068 | **sql** (5.76× vs Kysely) |
| INSERT batch 100 | **59,013** | 9,861 | 721 | **sql** (5.98× vs Kysely) |
| CTE | **320,055** | 156,995 | 39,028 | **sql** (2.04× vs Kysely) |
| SELECT 10 conditions | **428,707** | 87,150 | 15,439 | **sql** (4.92× vs Kysely) |

*ops/s — higher is better. Compilation only, no DB execution.*

---

### KVS Server

| Benchmark | KVS direct | WS RPC | HTTP REST |
|---|---|---|---|
| set('k','v') | 551,331 (100.0%) | 33,892 (6.1%) | 9,866 (1.8%) |
| get('k') hit | 633,996 (100.0%) | 25,183 (4.0%) | 9,909 (1.6%) |

*ops/s — higher is better. Sequential, one client; % is of direct in-process access.*

---
<!-- results:end -->

## Code Snippets

What each benchmark actually measures:

### Velox — HTTP frameworks

```ts
// @coderbuzz/velox — GET /hello
import { AppServer } from "@coderbuzz/velox";
const app = new AppServer({ port: 3000 });
app.get("/hello", { message: "Hello, World" });
app.run();

// Elysia — GET /hello (static value)
import { Elysia } from "elysia";
new Elysia().get("/hello", { message: "Hello, World" }).listen(3000);

// Express — GET /hello
import express from "express";
express().get("/hello", (_, res) => res.json({ message: "Hello, World" })).listen(3000);

// Hono — GET /hello
import { Hono } from "hono";
const app = new Hono().get("/hello", (c) => c.json({ message: "Hello, World" }));
Bun.serve({ fetch: app.fetch, port: 3000 });

// Dynamic variant (all four frameworks): handler returning an object
app.get("/hello", () => ({ message: "Hello, World" }));
```

```ts
// @coderbuzz/velox — POST /hello/:par1/:par2 with validation
app.post("/hello/:par1/:par2", {
  json: object({
    someKey: optional(string()),
    requiredKey: array(number({ integer: true }), { max: 3 }),
    enumKey: union([literal("John"), literal("Foo")]),
  }),
  query: { name: optional(string()) },
  params: { par1: optional(string()), par2: optional(coerce(number())) },
  headers: { "x-foo": string({ min: 1 }) },   // min: 1 — see note below
}, async (ctx) => {
  const { params, query, headers } = ctx;     // Velox validates lazily: touch every part
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
import t from "typebox";                       // TypeBox 1.x
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

> Before each run the runner checks that every server answers the valid request with
> `200 {"message":"Hello, World"}` and **rejects** an invalid enum, a non-integer or too-long
> `requiredKey`, a non-numeric `:par2` and a missing `x-foo` header. All four use the same
> rules (`requiredKey` integers, `par2` numeric). Hono's `tbValidator` cannot coerce, so its
> `par2` is a numeric-pattern string. Velox 0.7 passes a missing header to its validator as
> `""`, so the Velox server uses `string({ min: 1 })` to make `x-foo` actually required.

---

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

// TypeBox 1.x — simple validation (compiled)
const C = Compile(Type.Object({ name: Type.String({ minLength: 2, maxLength: 100 }), age: Type.Number({ minimum: 0, maximum: 150 }), active: Type.Boolean() }));
C.Parse(data)
```

```ts
// @coderbuzz/veta — coercion
object({ id: coerce(number()), active: coerce(boolean()), label: coerce(string()), born: coerce(date()) })

// Zod — coercion
z.object({ id: z.coerce.number(), active: z.coerce.boolean(), label: z.coerce.string(), born: z.coerce.date() })

// TypeBox 1.x — coercion (no Type.Date in 1.x: Date via Codec)
const C = Compile(Type.Object({ id: Type.Number(), active: Type.Boolean(), label: Type.String(),
  born: Type.Codec(Type.String()).Decode((v) => new Date(v)).Encode((d) => d.toISOString()) }));
C.Decode(C.Convert(data()))   // data() returns a fresh object: Convert mutates its input
```

---

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

---

### KVS — Sync/Async KV store

```ts
import { KVStore, AsyncKVStore } from "@coderbuzz/kvs";

// Sync SQLite
const kv = new KVStore("kv.db");
kv.set(["users", "alice"], { name: "Alice", plan: "pro" });
const entry = kv.get(["users", "alice"]);
kv.delete(["users", "alice"]);
kv.increment(["counter"]);                 // atomic, built-in

// Async SQLite
const asyncKV = new AsyncKVStore("kv.db");
await asyncKV.set(["users", "bob"], { name: "Bob" });
const bob = await asyncKV.get(["users", "bob"]);

// Async PostgreSQL
const pgKV = new AsyncKVStore("postgres://user:pass@localhost:5432/db");
await pgKV.reset();
await pgKV.set(["users", "carol"], { name: "Carol" });
```

---

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

const bytes = codec.encode(obj);
const val = codec.decode(bytes);
```

---

### Velox WS Wire — Binary WebSocket framing

```ts
import { encodePing, encodePublish, decode } from "@coderbuzz/velox-ws-wire";

// Wire format (binary)
const frame = encodePublish("chat:room1", JSON.stringify({ user: "alice", text: "Hello" }));
const msg  = decode(frame);

// JSON equivalent (baseline)
const json = JSON.stringify({ type: "publish", topic: "chat:room1", payload: "..." });
```

---

### SQL — Query compilation

```ts
// @coderbuzz/sql
import { sqlite } from "@coderbuzz/sql/sqlite";
const db = sqlite.connect({ path: ":memory:" });
const query = db.select("id", "name").from("users").where({ id: 1 }).toSQL();
// → { sql: 'SELECT id, name FROM users WHERE "id" = ?;', params: [1] }

// Drizzle ORM
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";
import { Database } from "bun:sqlite";
const users = sqliteTable("users", { id: integer("id").primaryKey(), name: text("name") });
const dz = drizzle(new Database(":memory:"));
const q2 = dz.select().from(users).where(eq(users.id, 1)).toSQL();
// → { sql: 'select "id", "name" from "users" where "users"."id" = ?', params: [1] }

// Kysely
import { Kysely, SqliteDialect } from "kysely";
interface DB { users: { id: number; name: string } }
const ky = new Kysely<DB>({ dialect: new SqliteDialect({ database: new Database(":memory:") }) });
const q3 = ky.selectFrom("users").selectAll().where("id", "=", 1).compile();
// → { sql: 'select * from "users" where "id" = ?', parameters: [1] }
```

---

### KVS Server — Transport overhead

```ts
import { createServer } from "@coderbuzz/kvs-server";
import { KVStore } from "@coderbuzz/kvs";

const store = new KVStore(":memory:");
const server = createServer(store, { port: 3000, accessToken: "token" });
await server.run();

// HTTP REST
await fetch("http://localhost:3000/kv/set", {
  method: "POST",
  headers: { Authorization: "Bearer token" },
  body: JSON.stringify({ key: ["k"], value: "v" }),
});

// WebSocket RPC
const ws = new WebSocket("ws://localhost:3000/ws?token=token");
ws.send(JSON.stringify({ id: 1, method: "/kv/get", params: { key: ["k"] } }));   // method names start with "/"
```

---

## Methodology

| Parameter | HTTP (Velox) | Micro-benchmarks |
|---|---|---|
| Tool | **oha** (default) or **wrk** (`WRK=1`) | `performance.now()` loop, [`src/_lib/harness.ts`](./src/_lib/harness.ts) |
| Load | 100 connections, keep-alive | single caller |
| Warmup | 3 s | 1,000 calls + calibration |
| Measurement | 3 × 10 s runs | 3 rounds of ~300 ms each (iterations calibrated per case) |
| Reported | best run | best round |
| Sanity checks | 200 + expected body; invalid input must be rejected; any non-2xx fails the run | valid input accepted/coerced, invalid rejected, codecs round-trip |
| Environment | `NODE_ENV=production`, server and load generator on the same machine | results written to a sink so the JIT cannot drop the call |

Knobs: `HTTP_RUNS`, `HTTP_DURATION`, `HTTP_WARMUP`, `BENCH_ROUNDS`, `BENCH_TARGET_MS`.

---

## Running Benchmarks

```sh
bun install

# Everything (HTTP + micro-benchmarks), then rebuild results/latest.json + README tables
bun run bench:all

# One benchmark (writes results/raw/<name>.json)
bun run velox:static        # or: bash src/velox/static-value/run.sh
bun run velox:dynamic
bun run velox:validation
bun run veta:vs
bun run veta:coerce
bun run msgpack:throughput
bun run proto:throughput
bun run kvs:throughput      # PostgreSQL part auto-skips if no server on :5432
bun run velox-ws-wire:throughput
bun run velox-ws-wire:wire-size
bun run sql:compile
bun run kvs-server:transport-overhead

# Rebuild results/latest.json, results/<date>.json and the README tables from results/raw
bun run results:build
```

---

## Packages

| Package | Benchmarks |
|---|---|
| [velox](./src/velox) | static-value, dynamic, validation |
| [velox-ws-wire](./src/velox-ws-wire) | throughput, wire-size |
| [veta](./src/veta) | vs, coerce |
| [kvs](./src/kvs) | throughput |
| [kvs-server](./src/kvs-server) | transport-overhead |
| [msgpack](./src/msgpack) | throughput |
| [proto](./src/proto) | throughput |
| [sql](./src/sql) | compile |
