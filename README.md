# `@coderbuzz` Benchmarks

Public benchmark suite for [@coderbuzz](https://github.com/coderbuzz) packages.

**For AI agents:** Machine-readable results at [`results/latest.json`](./results/latest.json)
([raw](https://raw.githubusercontent.com/coderbuzz/benchmarks/main/results/latest.json)).

<!-- results:start -->
## Latest Results (2026-10-09)

> Bun 1.4.2 · Intel(R) Xeon(R) Processor @ 2.80GHz, 4 cores, linux (x64) · generated from [`results/latest.json`](./results/latest.json) by `bun scripts/build-results.ts`

> **Note:** Measured on the npm releases velox 0.8.0 / veta 0.6.2 / proto 0.3.3 / kvs-server 6.1.4 / sql 0.9.6. Each micro-benchmark is the best of 3 separate processes (BENCH_PROCESSES=3).

### Velox

| Benchmark | @coderbuzz/velox | Elysia | Hono | Express | Winner |
|---|---|---|---|---|---|
| Static value | **117,352** | **120,347** | 56,626 | 21,952 | **Elysia ≈ velox** (tie; 2.13× vs Hono) |
| Dynamic handler | **63,942** | **65,487** | 54,382 | 21,218 | **Elysia ≈ velox** (tie; 1.20× vs Hono) |
| Validation POST | **31,004** | 21,320 | 17,867 | 10,555 | **velox** (1.45× vs Elysia) |

*req/s, higher is better. `oha -c 100`, 3 s warmup, best of 3 × 10 s runs. Static value: Velox/Elysia use a static route value, Hono/Express a handler. Results within 10% of the best are a tie (≈): repeat runs on the reference machine moved the best-of-3 figure by up to 8.1%.*

---

### Veta

| Benchmark | @coderbuzz/veta | Zod | Yup | Joi | TypeBox | Winner |
|---|---|---|---|---|---|---|
| Simple validation | 53,282,431 | 4,072,882 | 103,282 | 579,759 | **147,965,276** | **TypeBox** (2.78× vs veta) |
| Complex validation | **4,730,036** | 946,547 | 27,401 | 106,765 | 74,159 | **veta** (5.00× vs Zod) |
| Error handling | **432,322** | 309,689 | 85,467 | 272,834 | 196,459 | **veta** (1.40× vs Zod) |
| Check (boolean) | 80,692,643 | 3,686,227 | 104,419 | 484,230 | **150,007,057** | **TypeBox** (1.86× vs veta) |
| Error, first issue | **1,208,845** | 408,083 | 92,826 | 287,702 | 223,266 | **veta** (2.96× vs Zod) |
| Coercion | **14,236,420** | 6,615,929 | 94,880 | 364,302 | 34,669 | **veta** (2.15× vs Zod) |

*ops/s, higher is better. TypeBox uses the compiled validator (`Compile(schema)`). Veta rows Check (boolean) and Error, first issue use `is(schema, x)` and `safeParse(schema, x, undefined, { maxIssues: 1 })` where the installed veta has them (0.6+); the other rows use the throwing validator. Zod has no first-error mode.*

---

### Msgpack

| Benchmark | @coderbuzz/msgpack | @msgpack/msgpack | Winner |
|---|---|---|---|
| Encode (ops/s) | **1,215,467** | 273,681 | **msgpack** (4.44× vs @msgpack/msgpack) |
| Decode (ops/s) | **602,870** | 320,823 | **msgpack** (1.88× vs @msgpack/msgpack) |
| Wire size (bytes) | **133 B** | **133 B** | **msgpack = @msgpack/msgpack** |

*ops/s higher is better, wire size smaller is better. Msgpack libraries only: JSON.stringify returns an engine-native string, not bytes encoded in JS, so it is not a like-with-like contender.*

---

### Proto

| Benchmark | @coderbuzz/proto | @coderbuzz/msgpack | @msgpack/msgpack | Winner |
|---|---|---|---|---|
| Encode (ops/s) | **3,031,481** | 1,976,551 | 364,061 | **proto** (1.53× vs msgpack) |
| Decode (ops/s) | **973,923** | 892,491 | 459,937 | **proto** (1.09× vs msgpack) |
| Wire size (bytes) | **65 B** | 111 B | 111 B | **proto** (41% < msgpack) |

*ops/s higher is better, wire size smaller is better. Binary codecs only: JSON.stringify returns an engine-native string, not bytes encoded in JS, so it is not a like-with-like contender.*

---

### KVS

| Benchmark | bun:sqlite | Async SQLite | Async PostgreSQL |
|---|---|---|---|
| set('k', 'v') | 402,875 | 52,688 | 2,669 |
| get() hit | 627,607 | 62,110 | 8,430 |
| get() miss | 1,257,102 | 72,466 | 9,038 |
| delete() | 476,700 | 64,832 | 3,003 |
| increment() | 134,422 | 19,607 | 2,837 |

*ops/s, higher is better. Sequential, one caller. PostgreSQL runs on the same machine. `increment()` is the store's atomic built-in.*

---

### Velox WS Wire

| Benchmark | @coderbuzz/velox-ws-wire | JSON | Winner |
|---|---|---|---|
| PING encode | **2,876,743,384** | 13,248,443 | **velox-ws-wire** (217.14× vs JSON) |
| PING decode | **50,436,530** | 10,735,268 | **velox-ws-wire** (4.70× vs JSON) |
| PUBLISH encode | 4,021,164 | **5,661,517** | **JSON** (1.41× vs velox-ws-wire) |
| PUBLISH decode | **3,070,444** | 2,935,150 | **velox-ws-wire** (1.05× vs JSON) |
| REQUEST encode | **5,801,771** | 5,553,400 | **velox-ws-wire** (1.04× vs JSON) |
| REQUEST decode | **5,303,556** | 2,882,281 | **velox-ws-wire** (1.84× vs JSON) |
| RESPONSE encode | **5,688,290** | 5,482,516 | **velox-ws-wire** (1.04× vs JSON) |
| RESPONSE decode | **5,101,260** | 3,078,758 | **velox-ws-wire** (1.66× vs JSON) |
| SUBSCRIBE encode | 7,183,802 | **9,411,059** | **JSON** (1.31× vs velox-ws-wire) |
| SUBSCRIBE decode | 6,315,213 | **7,773,959** | **JSON** (1.23× vs velox-ws-wire) |

*ops/s, higher is better. `encodePing()` returns a shared pre-built buffer, so PING encode measures call overhead only.*

---

### Velox WS Wire (size)

| Benchmark | @coderbuzz/velox-ws-wire | JSON | Winner |
|---|---|---|---|
| PING | **1 B** | 15 B | **velox-ws-wire** (93% < JSON) |
| PUBLISH | **44 B** | 92 B | **velox-ws-wire** (52% < JSON) |
| REQUEST | **37 B** | 83 B | **velox-ws-wire** (55% < JSON) |
| RESPONSE | **37 B** | 84 B | **velox-ws-wire** (56% < JSON) |
| SUBSCRIBE | **12 B** | 41 B | **velox-ws-wire** (71% < JSON) |

*bytes, smaller is better.*

---

### SQL

| Benchmark | @coderbuzz/sql | Kysely | Drizzle ORM | Winner |
|---|---|---|---|---|
| SELECT simple | **764,451** | 371,561 | 30,005 | **sql** (2.06× vs Kysely) |
| SELECT JOIN | **374,221** | 195,203 | 13,104 | **sql** (1.92× vs Kysely) |
| INSERT single | **1,149,161** | 195,751 | 34,775 | **sql** (5.87× vs Kysely) |
| INSERT batch 100 | **49,304** | 7,462 | 559 | **sql** (6.61× vs Kysely) |
| CTE | **259,188** | 115,946 | 27,043 | **sql** (2.23× vs Kysely) |
| SELECT 10 conditions | **357,278** | 74,715 | 12,427 | **sql** (4.78× vs Kysely) |

*ops/s, higher is better. Compilation only, no DB execution.*

---

### KVS Server

| Benchmark | KVS direct | WS RPC | HTTP REST |
|---|---|---|---|
| set('k','v') | 392,031 (100.0%) | 15,274 (3.9%) | 6,545 (1.7%) |
| get('k') hit | 495,165 (100.0%) | 17,525 (3.5%) | 7,418 (1.5%) |

*ops/s, higher is better. Sequential, one client; % is of direct in-process access.*

---
<!-- results:end -->

## Code Snippets

What each benchmark actually measures:

### Velox: HTTP frameworks

```ts
// @coderbuzz/velox: GET /hello
import { AppServer } from "@coderbuzz/velox";
const app = new AppServer({ port: 3000 });
app.get("/hello", { message: "Hello, World" });
app.run();

// Elysia: GET /hello (static value)
import { Elysia } from "elysia";
new Elysia().get("/hello", { message: "Hello, World" }).listen(3000);

// Express: GET /hello
import express from "express";
express().get("/hello", (_, res) => res.json({ message: "Hello, World" })).listen(3000);

// Hono: GET /hello
import { Hono } from "hono";
const app = new Hono().get("/hello", (c) => c.json({ message: "Hello, World" }));
Bun.serve({ fetch: app.fetch, port: 3000 });

// Dynamic variant (all four frameworks): handler returning an object
app.get("/hello", () => ({ message: "Hello, World" }));
```

```ts
// @coderbuzz/velox: POST /hello/:par1/:par2 with validation
app.post("/hello/:par1/:par2", {
  json: object({
    someKey: optional(string()),
    requiredKey: array(number({ integer: true }), { max: 3 }),
    enumKey: union([literal("John"), literal("Foo")]),
  }),
  query: { name: optional(string()) },
  params: { par1: optional(string()), par2: optional(coerce(number())) },
  headers: { "x-foo": string({ min: 1 }) },   // min: 1, see note below
}, async (ctx) => {
  const { params, query, headers } = ctx;     // Velox validates lazily: touch every part
  await ctx.json;
  return Response.json({ message: "Hello, World" });
});

// Elysia: POST /hello/:par1/:par2 with validation (built-in TypeBox)
import { Elysia, t } from "elysia";
new Elysia().post("/hello/:par1/:par2", () => ({ message: "Hello, World" }), {
  body: t.Object({ someKey: t.Optional(t.String()), requiredKey: t.Array(t.Integer(), { maxItems: 3 }) }),
  query: t.Object({ name: t.Optional(t.String()) }),
  params: t.Object({ par1: t.Optional(t.String()), par2: t.Optional(t.Number()) }),
  headers: t.Object({ "x-foo": t.String() }),
}).listen(3000);

// Hono: POST /hello/:par1/:par2 with validation (TypeBox via @hono/typebox-validator)
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

// Express: POST /hello/:par1/:par2 with validation (Zod)
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

### Veta: Validation libraries

```ts
// @coderbuzz/veta: simple validation
object({ name: string({ min: 2, max: 100 }), age: number({ min: 0, max: 150 }), active: boolean() })

// Zod: simple validation
z.object({ name: z.string().min(2).max(100), age: z.number().min(0).max(150), active: z.boolean() })

// Joi: simple validation
Joi.object({ name: Joi.string().min(2).max(100).required(), age: Joi.number().min(0).max(150).required(), active: Joi.boolean().required() })

// Yup: simple validation
yup.object({ name: yup.string().min(2).max(100).required(), age: yup.number().min(0).max(150).required(), active: yup.boolean().required() })

// TypeBox 1.x: simple validation (compiled)
const C = Compile(Type.Object({ name: Type.String({ minLength: 2, maxLength: 100 }), age: Type.Number({ minimum: 0, maximum: 150 }), active: Type.Boolean() }));
C.Parse(data)
```

```ts
// @coderbuzz/veta: coercion
object({ id: coerce(number()), active: coerce(boolean()), label: coerce(string()), born: coerce(date()) })

// Zod: coercion
z.object({ id: z.coerce.number(), active: z.coerce.boolean(), label: z.coerce.string(), born: z.coerce.date() })

// TypeBox 1.x: coercion (no Type.Date in 1.x: Date via Codec)
const C = Compile(Type.Object({ id: Type.Number(), active: Type.Boolean(), label: Type.String(),
  born: Type.Codec(Type.String()).Decode((v) => new Date(v)).Encode((d) => d.toISOString()) }));
C.Decode(C.Convert(data()))   // data() returns a fresh object: Convert mutates its input
```

---

### Msgpack: Codec libraries

```ts
// @coderbuzz/msgpack
import { encode, decode } from "@coderbuzz/msgpack";
const buf = encode(obj);
const val = decode(buf);

// @msgpack/msgpack
import { encode, decode } from "@msgpack/msgpack";
const buf = encode(obj);
const val = decode(buf);
```

---

### KVS: Sync/Async KV store

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

### Proto: Binary codec

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

### Velox WS Wire: Binary WebSocket framing

```ts
import { encodePing, encodePublish, decode } from "@coderbuzz/velox-ws-wire";

// Wire format (binary)
const frame = encodePublish("chat:room1", JSON.stringify({ user: "alice", text: "Hello" }));
const msg  = decode(frame);

// JSON equivalent (baseline)
const json = JSON.stringify({ type: "publish", topic: "chat:room1", payload: "..." });
```

---

### SQL: Query compilation

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

### KVS Server: Transport overhead

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
| Measurement | 3 × 10 s runs | 3 processes × 3 rounds of ~300 ms each (iterations calibrated per case) |
| Reported | best run | best round across all processes |
| Sanity checks | 200 + expected body; invalid input must be rejected; any non-2xx fails the run | valid input accepted/coerced, invalid rejected, codecs round-trip |
| Environment | `NODE_ENV=production`, server and load generator on the same machine | results written to a sink so the JIT cannot drop the call |
| Machine | the Claude Code cloud environment (Linux x64, 4 cores; Xeon clock varies by session, recorded in the header above and `meta.machine`). Each publish is one full `bench:all` run on one machine; compare absolute numbers across runs only when the machine matches | same machine |

Knobs: `HTTP_RUNS`, `HTTP_DURATION`, `HTTP_WARMUP`, `BENCH_ROUNDS`, `BENCH_TARGET_MS`, `BENCH_PROCESSES` (`bench:all` only).

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
