# `@coderbuzz` Benchmarks

Public benchmark suite for [@coderbuzz](https://github.com/coderbuzz) packages.

**For AI agents:** Machine-readable results at [`results/latest.json`](./results/latest.json)
([raw](https://raw.githubusercontent.com/coderbuzz/benchmarks/main/results/latest.json)).

<!-- results:start -->
## Latest Results (2026-10-11)

> Bun 1.4.3 · Intel(R) Xeon(R) Processor @ 2.80GHz, family 6 model 85 stepping 7, 4 cores, linux (x64) · generated from [`results/latest.json`](./results/latest.json) by `bun scripts/build-results.ts`

### Velox

| Benchmark | @coderbuzz/velox | Elysia | Hono | Express | Winner |
|---|---|---|---|---|---|
| Static value | **124,956** | **114,005** | 47,206 | 20,346 | **velox ≈ Elysia** (tie; 2.65× vs Hono) |
| Dynamic handler | **54,460** | **56,690** | 46,957 | 19,081 | **Elysia ≈ velox** (tie; 1.21× vs Hono) |
| Validation POST | **28,472** | 20,452 | 16,948 | 9,131 | **velox** (1.39× vs Elysia) |

*req/s, higher is better. `oha -c 100`, 3 s warmup, best of 4 interleaved rounds of 10 s (each round runs every framework once, order rotated, fresh server and warmup per run). Static value: Velox/Elysia use a static route value, Hono/Express a handler. Results within 10% of the best are a tie (≈): two full runs on one machine moved the best-of-3 figure by up to 8.1%.*

---

### Veta

| Benchmark | @coderbuzz/veta | Zod | Yup | Joi | TypeBox | Winner |
|---|---|---|---|---|---|---|
| Simple validation | 40,438,236 | 2,858,182 | 87,860 | 437,134 | **96,049,578** | **TypeBox** (2.38× vs veta) |
| Complex validation | **3,925,657** | 768,858 | 20,075 | 84,766 | 73,589 | **veta** (5.11× vs Zod) |
| Error handling | **390,586** | 232,602 | 76,063 | 328,996 | 176,507 | **veta** (1.19× vs Joi) |
| Check (boolean) | **113,710,475** | 3,037,684 | 89,620 | 432,428 | 101,074,191 | **veta** (1.13× vs TypeBox) |
| Error, first issue | **1,239,872** | 446,116 | 87,614 | 322,842 | 212,586 | **veta** (2.78× vs Zod) |
| Coercion | **12,325,686** | 4,722,975 | 80,359 | 308,834 | 32,927 | **veta** (2.61× vs Zod) |

*ops/s, higher is better. TypeBox uses the compiled validator (`Compile(schema)`). Veta rows Check (boolean) and Error, first issue use `is(schema, x)` and `safeParse(schema, x, undefined, { maxIssues: 1 })` where the installed veta has them (0.6+); the other rows use the throwing validator. Zod has no first-error mode. Simple validation compares different work: Veta returns a new object with unknown keys stripped, TypeBox `Parse` checks and returns the input object itself. The like-for-like row for `Parse` is Check (boolean).*

---

### Msgpack

| Benchmark | @coderbuzz/msgpack | @msgpack/msgpack | Winner |
|---|---|---|---|
| Encode (ops/s) | **1,145,654** | 330,378 | **msgpack** (3.47× vs @msgpack/msgpack) |
| Decode (ops/s) | **519,539** | 322,905 | **msgpack** (1.61× vs @msgpack/msgpack) |
| Wire size (bytes) | **133 B** | **133 B** | **msgpack = @msgpack/msgpack** |

*ops/s higher is better, wire size smaller is better. Msgpack libraries only: JSON.stringify returns an engine-native string, not bytes encoded in JS, so it is not a like-with-like contender.*

---

### Proto

| Benchmark | @coderbuzz/proto | @coderbuzz/msgpack | @msgpack/msgpack | Winner |
|---|---|---|---|---|
| Encode (ops/s) | **2,440,544** | 1,768,796 | 430,912 | **proto** (1.38× vs msgpack) |
| Decode (ops/s) | **862,132** | 718,961 | 437,444 | **proto** (1.20× vs msgpack) |
| Wire size (bytes) | **65 B** | 111 B | 111 B | **proto** (41% < msgpack) |

*ops/s higher is better, wire size smaller is better. Binary codecs only: JSON.stringify returns an engine-native string, not bytes encoded in JS, so it is not a like-with-like contender.*

---

### KVS

| Benchmark | bun:sqlite | Async SQLite | Async PostgreSQL |
|---|---|---|---|
| set('k', 'v') | 346,065 | 45,171 | 2,592 |
| get() hit | 568,138 | 56,903 | 8,559 |
| get() miss | 1,127,643 | 61,043 | 9,828 |
| delete() | 453,814 | 57,970 | 2,485 |
| increment() | 118,455 | 13,957 | 2,610 |

*ops/s, higher is better. Sequential, one caller. PostgreSQL runs on the same machine. `increment()` is the store's atomic built-in.*

---

### Velox WS Wire

| Benchmark | @coderbuzz/velox-ws-wire | JSON | Winner |
|---|---|---|---|
| PING decode | **42,012,698** | 9,806,209 | **velox-ws-wire** (4.28× vs JSON) |
| PUBLISH encode | 3,542,876 | **4,921,649** | **JSON** (1.39× vs velox-ws-wire) |
| PUBLISH decode | 2,994,453 | **3,501,836** | **JSON** (1.17× vs velox-ws-wire) |
| REQUEST encode | **5,238,346** | 4,726,233 | **velox-ws-wire** (1.11× vs JSON) |
| REQUEST decode | **4,929,742** | 3,385,870 | **velox-ws-wire** (1.46× vs JSON) |
| RESPONSE encode | **6,638,061** | 5,018,005 | **velox-ws-wire** (1.32× vs JSON) |
| RESPONSE decode | **4,838,164** | 3,228,000 | **velox-ws-wire** (1.50× vs JSON) |
| SUBSCRIBE encode | 6,900,682 | **8,454,269** | **JSON** (1.23× vs velox-ws-wire) |
| SUBSCRIBE decode | 5,464,495 | **7,750,058** | **JSON** (1.42× vs velox-ws-wire) |

*ops/s, higher is better. PING has no encode row: `encodePing()` returns a shared pre-built buffer, so there is no encoding to measure.*

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
| SELECT simple | **617,464** | 286,134 | 23,801 | **sql** (2.16× vs Kysely) |
| SELECT JOIN | **329,429** | 170,138 | 11,383 | **sql** (1.94× vs Kysely) |
| INSERT single | **903,337** | 176,733 | 26,819 | **sql** (5.11× vs Kysely) |
| INSERT batch 100 | **37,749** | 7,412 | 450 | **sql** (5.09× vs Kysely) |
| CTE | **182,258** | 102,485 | 23,433 | **sql** (1.78× vs Kysely) |
| SELECT 10 conditions | **252,755** | 67,007 | 11,034 | **sql** (3.77× vs Kysely) |

*ops/s, higher is better. Compilation only, no DB execution.*

---

### KVS Server

| Benchmark | KVS direct | WS RPC | HTTP REST |
|---|---|---|---|
| set('k','v') | 357,510 (100.0%) | 46,361 (13.0%) | 5,858 (1.6%) |
| get('k') hit | 441,618 (100.0%) | 48,700 (11.0%) | 5,619 (1.3%) |

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
| Measurement | 4 interleaved rounds × 10 s (order rotated, fresh server per run) | 3 processes × 3 rounds of ~300 ms each (iterations calibrated per case) |
| Reported | best run | best round across all processes |
| Sanity checks | 200 + expected body; invalid input must be rejected; any non-2xx fails the run | valid input accepted/coerced, invalid rejected, codecs round-trip |
| Environment | `NODE_ENV=production`, server and load generator on the same machine | results written to a sink so the JIT cannot drop the call |
| Machine | whichever machine ran it, recorded in the header above and `meta.machine` (CPU with family/model/stepping, cores, OS). Each publish is one full `bench:all` run on one machine; compare absolute numbers across runs only when the machine matches, since winners can move with the CPU | same machine |

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
