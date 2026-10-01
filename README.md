# `@coderbuzz` Benchmarks

Public benchmark suite for [@coderbuzz](https://github.com/coderbuzz) packages.

**For AI agents:** Machine-readable results at [`results/latest.json`](./results/latest.json)
([raw](https://raw.githubusercontent.com/coderbuzz/benchmarks/main/results/latest.json)).

<!-- results:start -->
## Latest Results (2026-10-01)

> Bun 1.4.2 · Apple M3 (arm64) · generated from [`results/latest.json`](./results/latest.json) by `bun scripts/build-results.ts`

### Velox

| Benchmark | @coderbuzz/velox | Elysia | Hono | Express | Winner |
|---|---|---|---|---|---|
| Static value | 273,455 | **274,931** | 205,801 | 114,368 | **Elysia** (1.00× vs velox) |
| Dynamic handler | 211,267 | **214,195** | 175,530 | 111,093 | **Elysia** (1.01× vs velox) |
| Validation POST | **114,298** | 112,956 | 106,165 | 70,049 | **velox** (1.01× vs Elysia) |

*req/s — higher is better. `oha -c 100`, 3 s warmup, best of 3 × 10 s runs. Static value: Velox/Elysia use a static route value, Hono/Express a handler.*

---

### Veta

| Benchmark | @coderbuzz/veta | Zod | Yup | Joi | TypeBox | Winner |
|---|---|---|---|---|---|---|
| Simple validation | 34,279,209 | 10,528,325 | 381,793 | 1,886,191 | **277,036,931** | **TypeBox** (8.08× vs veta) |
| Complex validation | **3,787,471** | 3,485,016 | 91,218 | 425,950 | 231,664 | **veta** (1.09× vs Zod) |
| Error handling | **1,257,154** | 995,308 | 324,656 | 1,254,364 | 785,984 | **veta** (1.00× vs Joi) |
| Coercion | 6,190,477 | **19,080,585** | 331,168 | 1,279,783 | 106,240 | **Zod** (3.08× vs veta) |

*ops/s — higher is better. TypeBox uses the compiled validator (`Compile(schema)`).*

---

### Msgpack

| Benchmark | @coderbuzz/msgpack | JSON | @msgpack/msgpack | Winner |
|---|---|---|---|---|
| Encode (ops/s) | 2,654,986 | **5,933,422** | 1,631,099 | **JSON** (2.23× vs msgpack) |
| Decode (ops/s) | 2,377,409 | **3,573,542** | 1,325,768 | **JSON** (1.50× vs msgpack) |
| Wire size (bytes) | **133 B** | 178 B | **133 B** | **msgpack = @msgpack/msgpack** (25% < JSON) |

*ops/s higher is better, wire size smaller is better.*

---

### Proto

| Benchmark | @coderbuzz/proto | @coderbuzz/msgpack | JSON | @msgpack/msgpack | Winner |
|---|---|---|---|---|---|
| Encode (ops/s) | 6,821,303 | 4,061,862 | **9,446,610** | 2,036,146 | **JSON** (1.39× vs proto) |
| Decode (ops/s) | 4,424,769 | 2,888,723 | **5,618,090** | 1,636,089 | **JSON** (1.27× vs proto) |
| Wire size (bytes) | **65 B** | 111 B | 139 B | 111 B | **proto** (41% < msgpack) |

*ops/s higher is better, wire size smaller is better.*

---

### KVS

| Benchmark | bun:sqlite | Async SQLite | Async PostgreSQL |
|---|---|---|---|
| set('k', 'v') | 720,278 | 171,344 | 2,069 |
| get() — hit | 1,627,066 | 215,026 | 12,478 |
| get() — miss | 2,829,532 | 229,302 | 12,500 |
| delete() | 923,743 | 118,874 | 1,752 |
| increment() | 433,302 | 85,325 | 1,528 |

*ops/s — higher is better. Sequential, one caller. PostgreSQL runs in Docker (OrbStack) on the same machine.*

---

### Velox WS Wire

| Benchmark | @coderbuzz/velox-ws-wire | JSON | Winner |
|---|---|---|---|
| PING encode | **3,341,574,980** | 41,398,952 | **velox-ws-wire** (80.72× vs JSON) |
| PING decode | **401,495,925** | 30,821,232 | **velox-ws-wire** (13.03× vs JSON) |
| PUBLISH encode | **14,557,941** | 13,892,940 | **velox-ws-wire** (1.05× vs JSON) |
| PUBLISH decode | **10,487,320** | 6,096,887 | **velox-ws-wire** (1.72× vs JSON) |
| REQUEST encode | **21,693,187** | 13,228,922 | **velox-ws-wire** (1.64× vs JSON) |
| REQUEST decode | **18,335,948** | 6,356,970 | **velox-ws-wire** (2.88× vs JSON) |
| RESPONSE encode | **22,765,536** | 13,917,728 | **velox-ws-wire** (1.64× vs JSON) |
| RESPONSE decode | **17,836,612** | 6,413,028 | **velox-ws-wire** (2.78× vs JSON) |
| SUBSCRIBE encode | **31,163,547** | 27,636,540 | **velox-ws-wire** (1.13× vs JSON) |
| SUBSCRIBE decode | **21,645,712** | 18,634,812 | **velox-ws-wire** (1.16× vs JSON) |

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
| SELECT simple | **3,053,698** | 1,134,171 | 101,277 | **sql** (2.69× vs Kysely) |
| SELECT JOIN | **1,607,986** | 658,062 | 45,503 | **sql** (2.44× vs Kysely) |
| INSERT single | **3,878,305** | 698,670 | 125,466 | **sql** (5.55× vs Kysely) |
| INSERT batch 100 | **149,374** | 24,636 | 2,074 | **sql** (6.06× vs Kysely) |
| CTE | **1,053,981** | 454,761 | 29,963 | **sql** (2.32× vs Kysely) |
| SELECT 10 conditions | **1,233,330** | 261,661 | 41,625 | **sql** (4.71× vs Kysely) |

*ops/s — higher is better. Compilation only, no DB execution.*

---

### KVS Server

| Benchmark | KVS direct | WS RPC | HTTP REST |
|---|---|---|---|
| set('k','v') | 710,280 (100.0%) | 51,342 (7.2%) | 25,234 (3.6%) |
| get('k') hit | 1,362,372 (100.0%) | 50,493 (3.7%) | 25,922 (1.9%) |

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
    requiredKey: array(number(), { max: 3 }),
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
> `200 {"message":"Hello, World"}` and **rejects** an invalid body and a missing `x-foo`
> header. Velox 0.7 passes a missing header to its validator as `""`, so the Velox server
> uses `string({ min: 1 })` to make `x-foo` actually required.

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
