# `@coderbuzz` Benchmarks

Public benchmark suite for [@coderbuzz](https://github.com/coderbuzz) packages.

**For AI agents:** Machine-readable results at [`results/latest.json`](./results/latest.json)
([raw](https://raw.githubusercontent.com/coderbuzz/benchmarks/main/results/latest.json)).

<!-- results:start -->
## Latest Results (2026-10-09)

> Bun 1.4.2 · Intel(R) Xeon(R) Processor @ 2.10GHz, 4 cores, linux (x64) · generated from [`results/latest.json`](./results/latest.json) by `bun scripts/build-results.ts`

> **Note:** Measured on the npm releases velox 0.8.0 / veta 0.6.1 / proto 0.3.2 / kvs-server 6.1.3 / sql 0.9.5.

### Velox

| Benchmark | @coderbuzz/velox | Elysia | Hono | Express | Winner |
|---|---|---|---|---|---|
| Static value | **138,310** | **144,682** | 76,860 | 39,039 | **Elysia ≈ velox** (tie; 1.88× vs Hono) |
| Dynamic handler | **98,460** | **100,137** | 79,985 | 40,044 | **Elysia ≈ velox** (tie; 1.25× vs Hono) |
| Validation POST | **51,216** | 40,209 | 34,325 | 18,981 | **velox** (1.27× vs Elysia) |

*req/s, higher is better. `oha -c 100`, 3 s warmup, best of 3 × 10 s runs. Static value: Velox/Elysia use a static route value, Hono/Express a handler. Results within 10% of the best are a tie (≈): repeat runs on the reference machine moved the best-of-3 figure by up to 8.1%.*

---

### Veta

| Benchmark | @coderbuzz/veta | Zod | Yup | Joi | TypeBox | Winner |
|---|---|---|---|---|---|---|
| Simple validation | 52,576,700 | 4,863,554 | 133,957 | 695,130 | **166,800,816** | **TypeBox** (3.17× vs veta) |
| Complex validation | **5,219,809** | 1,199,716 | 30,370 | 132,243 | 84,265 | **veta** (4.35× vs Zod) |
| Error handling | **536,808** | 332,794 | 111,689 | 352,680 | 207,115 | **veta** (1.52× vs Joi) |
| Check (boolean) | 50,457,686 | 4,573,293 | 118,306 | 641,887 | **80,273,068** | **TypeBox** (1.59× vs veta) |
| Error, first issue | **1,547,750** | 523,117 | 117,154 | 374,052 | 255,462 | **veta** (2.96× vs Zod) |
| Coercion | **9,389,807** | 7,214,749 | 106,765 | 418,809 | 40,172 | **veta** (1.30× vs Zod) |

*ops/s, higher is better. TypeBox uses the compiled validator (`Compile(schema)`). Veta rows Check (boolean) and Error, first issue use `is(schema, x)` and `safeParse(schema, x, undefined, { maxIssues: 1 })` where the installed veta has them (0.6+); the other rows use the throwing validator. Zod has no first-error mode.*

---

### Msgpack

| Benchmark | @coderbuzz/msgpack | @msgpack/msgpack | Winner |
|---|---|---|---|
| Encode (ops/s) | **1,467,669** | 369,788 | **msgpack** (3.97× vs @msgpack/msgpack) |
| Decode (ops/s) | **784,511** | 455,191 | **msgpack** (1.72× vs @msgpack/msgpack) |
| Wire size (bytes) | **133 B** | **133 B** | **msgpack = @msgpack/msgpack** |

*ops/s higher is better, wire size smaller is better. Msgpack libraries only: JSON.stringify returns an engine-native string, not bytes encoded in JS, so it is not a like-with-like contender.*

---

### Proto

| Benchmark | @coderbuzz/proto | @coderbuzz/msgpack | @msgpack/msgpack | Winner |
|---|---|---|---|---|
| Encode (ops/s) | **3,475,009** | 2,597,721 | 420,295 | **proto** (1.34× vs msgpack) |
| Decode (ops/s) | **1,217,906** | 1,075,252 | 577,392 | **proto** (1.13× vs msgpack) |
| Wire size (bytes) | **65 B** | 111 B | 111 B | **proto** (41% < msgpack) |

*ops/s higher is better, wire size smaller is better. Binary codecs only: JSON.stringify returns an engine-native string, not bytes encoded in JS, so it is not a like-with-like contender.*

---

### KVS

| Benchmark | bun:sqlite | Async SQLite | Async PostgreSQL |
|---|---|---|---|
| set('k', 'v') | 440,377 | 60,071 | 3,888 |
| get() hit | 716,618 | 77,068 | 13,559 |
| get() miss | 1,383,584 | 90,786 | 13,103 |
| delete() | 512,111 | 85,539 | 4,141 |
| increment() | 142,070 | 24,326 | 3,802 |

*ops/s, higher is better. Sequential, one caller. PostgreSQL runs on the same machine. `increment()` is the store's atomic built-in.*

---

### Velox WS Wire

| Benchmark | @coderbuzz/velox-ws-wire | JSON | Winner |
|---|---|---|---|
| PING encode | **2,373,559,273** | 15,950,304 | **velox-ws-wire** (148.81× vs JSON) |
| PING decode | **69,226,467** | 11,484,354 | **velox-ws-wire** (6.03× vs JSON) |
| PUBLISH encode | 4,645,504 | **6,451,660** | **JSON** (1.39× vs velox-ws-wire) |
| PUBLISH decode | **3,474,206** | 3,033,170 | **velox-ws-wire** (1.15× vs JSON) |
| REQUEST encode | **7,391,182** | 6,721,882 | **velox-ws-wire** (1.10× vs JSON) |
| REQUEST decode | **6,408,394** | 3,132,574 | **velox-ws-wire** (2.05× vs JSON) |
| RESPONSE encode | **7,906,880** | 7,350,646 | **velox-ws-wire** (1.08× vs JSON) |
| RESPONSE decode | **6,468,063** | 3,026,944 | **velox-ws-wire** (2.14× vs JSON) |
| SUBSCRIBE encode | **10,096,957** | 9,294,089 | **velox-ws-wire** (1.09× vs JSON) |
| SUBSCRIBE decode | 5,241,883 | **7,393,700** | **JSON** (1.41× vs velox-ws-wire) |

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
| SELECT simple | **892,226** | 386,536 | 31,604 | **sql** (2.31× vs Kysely) |
| SELECT JOIN | **429,194** | 227,499 | 15,174 | **sql** (1.89× vs Kysely) |
| INSERT single | **1,179,221** | 233,934 | 35,911 | **sql** (5.04× vs Kysely) |
| INSERT batch 100 | **57,494** | 7,860 | 689 | **sql** (7.32× vs Kysely) |
| CTE | **296,815** | 133,328 | 33,904 | **sql** (2.23× vs Kysely) |
| SELECT 10 conditions | **339,167** | 82,595 | 13,043 | **sql** (4.11× vs Kysely) |

*ops/s, higher is better. Compilation only, no DB execution.*

---

### KVS Server

| Benchmark | KVS direct | WS RPC | HTTP REST |
|---|---|---|---|
| set('k','v') | 443,497 (100.0%) | 25,670 (5.8%) | 10,893 (2.5%) |
| get('k') hit | 502,120 (100.0%) | 26,028 (5.2%) | 9,676 (1.9%) |

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
| Machine | every published result comes from one reference machine: the Claude Code cloud environment (Linux x64, Intel Xeon @ 2.10GHz, 4 cores) | same machine |

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
