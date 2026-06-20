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

### KVS — Async Throughput

| Operation | Sync SQLite | Async SQLite | Async PostgreSQL |
|---|---|---|---|
| set('k', 'v') | 205,747 | 65,001 | 1,621 |
| get() — hit | 1,241,691 | 140,799 | 9,206 |
| get() — miss | 2,140,495 | 155,489 | 8,491 |
| delete() | 1,786,171 | 270,737 | 10,495 |
| increment() | 162,501 | 43,183 | 1,621 |

### Proto

| Benchmark | proto | @coderbuzz/msgpack | JSON | @msgpack/msgpack | Winner |
|---|---|---|---|---|---|
| Encode (ops/s) | **4,694,891** | 3,275,386 | 6,892,630 | 1,323,117 | JSON.stringify |
| Decode (ops/s) | **3,109,557** | 1,231,876 | 3,320,669 | 1,086,271 | JSON.parse |
| Wire size | **65 B** | 111 B | 139 B | 111 B | **proto** (53% < JSON) |

*ops/s higher is better, wire size smaller is better*

### Velox WS Wire

| Frame | Operation | Wire (ops/s) | JSON (ops/s) | Winner |
|---|---|---|---|---|
| PING | Encode | **12,901,701** | 6,897,781 | Wire (1.9×) |
| PING | Decode | **21,653,617** | 13,089,005 | Wire (1.7×) |
| PUBLISH | Encode | **7,834,279** | 5,512,983 | Wire (1.4×) |
| PUBLISH | Decode | **7,451,981** | 4,127,314 | Wire (1.8×) |
| REQUEST | Encode | **18,723,086** | 6,284,763 | Wire (3.0×) |
| REQUEST | Decode | **13,800,718** | 4,255,561 | Wire (3.2×) |
| RESPONSE | Encode | **16,474,465** | 6,316,388 | Wire (2.6×) |
| RESPONSE | Decode | **11,844,013** | 4,295,917 | Wire (2.8×) |
| SUBSCRIBE | Encode | **23,940,627** | 14,113,995 | Wire (1.7×) |
| SUBSCRIBE | Decode | **16,144,005** | 12,023,688 | Wire (1.3×) |

**Wire size:** Wire format is 52–93% smaller than JSON equivalent per frame.

| Frame | Wire | JSON | Saved |
|---|---|---|---|
| PING | 1 B | 15 B | 93% |
| PUBLISH (short) | 44 B | 92 B | 52% |
| REQUEST | 37 B | 83 B | 55% |
| RESPONSE | 37 B | 84 B | 56% |
| SUBSCRIBE | 12 B | 41 B | 71% |

### SQL — Query compilation throughput

| Query Type | @coderbuzz/sql | Kysely | Drizzle ORM | Winner |
|---|---|---|---|---|
| SELECT simple | **1,367,779** | 398,660 | 34,296 | sql (3.4× vs kysely) |
| SELECT JOIN | **2,337,746** | 312,739 | 16,968 | sql (7.5× vs kysely) |
| INSERT single | **2,676,731** | 401,904 | 54,039 | sql (6.7× vs kysely) |
| INSERT batch 100 | **139,171** | 14,859 | 806 | sql (9.4× vs kysely) |
| CTE | **552,135** | 306,162 | 10,235 | sql (1.8× vs kysely) |
| 10 conditions | **676,078** | 92,788 | 10,926 | sql (7.3× vs kysely) |

*ops/s — higher is better. Compilation only, no DB execution.*

### KVS Server — Transport overhead

| Operation | KVS direct | WS RPC | HTTP REST |
|---|---|---|---|
| set('k','v') | **206,456** (100%) | 54,486 (26.4%) | 19,730 (9.6%) |
| get('k') hit | **1,207,922** (100%) | 56,136 (4.6%) | 24,943 (2.1%) |

*ops/s — higher is better. WS RPC retains 26% of direct throughput for writes.*

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

### KVS — Sync/Async KV store

```ts
import { KVStore, AsyncKVStore } from "@coderbuzz/kvs";

// Sync SQLite
const kv = new KVStore("kv.db");
kv.set(["users", "alice"], { name: "Alice", plan: "pro" });  // 215K ops/s
const entry = kv.get(["users", "alice"]);                      // 1.2M ops/s
kv.delete(["users", "alice"]);                                 // 1.6M ops/s

// Async SQLite
const asyncKV = new AsyncKVStore("kv.db");
await asyncKV.set(["users", "bob"], { name: "Bob" });
const bob = await asyncKV.get(["users", "bob"]);

// Async PostgreSQL
const pgKV = new AsyncKVStore("postgres://user:pass@localhost:5432/db");
await pgKV.reset();
await pgKV.set(["users", "carol"], { name: "Carol" });
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

### Velox WS Wire — Binary WebSocket framing

```ts
import { encodePing, encodePublish, decode } from "@coderbuzz/velox-ws-wire";

// Wire format (binary)
const frame = encodePublish("chat:room1", JSON.stringify({ user: "alice", text: "Hello" }));
const msg  = decode(frame);

// JSON equivalent (baseline)
const json = JSON.stringify({ type: "publish", topic: "chat:room1", payload: "..." });
```

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
ws.send(JSON.stringify({ id: 1, method: "kv/get", params: { key: ["k"] } }));
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

# New benchmarks
bash src/velox-ws-wire/throughput/run.sh
bash src/velox-ws-wire/wire-size/run.sh
bash src/sql/compile/run.sh
bash src/kvs-server/transport-overhead/run.sh

# Or via npm scripts
bun run velox-ws-wire:throughput
bun run velox-ws-wire:wire-size
bun run sql:compile
bun run kvs:async-throughput
bun run kvs-server:transport-overhead
```

## Packages

| Package | Benchmarks |
|---|---|
| [velox](./src/velox) | static-value, validation |
| [velox-ws-wire](./src/velox-ws-wire) | throughput, wire-size |
| [veta](./src/veta) | vs-zod, coerce |
| [kvs](./src/kvs) | throughput, async-throughput |
| [kvs-server](./src/kvs-server) | transport-overhead |
| [msgpack](./src/msgpack) | throughput |
| [proto](./src/proto) | throughput |
| [sql](./src/sql) | compile |
