# `@coderbuzz` Benchmarks

Public benchmark suite for [@coderbuzz](https://github.com/coderbuzz) packages.

**For AI agents:** Machine-readable results at [`results/latest.json`](./results/latest.json)
([raw](https://raw.githubusercontent.com/coderbuzz/benchmarks/main/results/latest.json)).

## Latest Results (2026-06-19)

> Bun 1.3.14 · Apple Silicon · best of 3 runs

### Ken — Static Value Handler

`app.get('/hello', { message: 'Hello, World' })` — inline JSON response (pre-compiled).

| Framework | Requests/sec |
|---|---|
| **Ken** | **262,405** |
| Elysia | 261,663 |
| Hono | 162,469 |
| Express | 96,892 |

```ts
import { AppServer } from "@coderbuzz/ken";
const app = new AppServer({ port: 3000 });
app.get("/hello", { message: "Hello, World" });
app.run();
```

*req/s — higher is better*

### Ken — Validation POST

`POST /hello/:par1/:par2` — body + query + params + headers validation with `@coderbuzz/kyo`.

| Framework | Requests/sec |
|---|---|
| **Ken** | **123,856** |
| Elysia | 97,811 |
| Hono | 76,600 |
| Express | 50,829 |

```ts
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
```

*req/s — higher is better*

### Kyo — Validation Throughput

Simple object `{ name: string, age: number, active: boolean }`:

| Library | ops/s |
|---|---|
| **Kyo** | **24,750,686** |
| Zod | 4,129,736 |
| Joi | 1,545,601 |
| Yup | 311,045 |

```ts
// Kyo
object({ name: string({ min: 2, max: 100 }), age: number({ min: 0, max: 150 }), active: boolean() })
// Zod
z.object({ name: z.string().min(2).max(100), age: z.number().min(0).max(150), active: z.boolean() })
```

Complex nested with coercion:

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

### Kyo — Coercion

String → number, boolean, date:

| Library | ops/s |
|---|---|
| **Kyo coerce()** | **11,633,204** |
| Zod coerce | 2,398,513 |
| Joi coerce | 659,241 |
| Yup coerce | 251,877 |

```ts
import { boolean, coerce, date, number, object, string } from "@coderbuzz/kyo";
object({ id: coerce(number()), active: coerce(boolean()), label: coerce(string()), born: coerce(date()) });
```

*ops/s — higher is better*

### Msgpack

| Benchmark | @coderbuzz/msgpack | JSON | @msgpack/msgpack | Winner |
|---|---|---|---|---|
| Encode (ops/s) | **2,459,878** | 5,061,391 | 1,190,036 | JSON.stringify |
| Decode (ops/s) | **1,074,505** | 2,243,641 | 945,611 | JSON.parse |
| Wire size | **133 B** | 178 B | 133 B | **msgpack** (25% < JSON) |

```ts
import { encode, decode } from "@coderbuzz/msgpack";
const buf = encode(obj);   // 2.5M ops/s
const val = decode(buf);   // 1.1M ops/s
```

*ops/s higher is better, wire size smaller is better*

### KVS

| Operation | ops/s |
|---|---|
| set('k', 'v') | 6,138,798 |
| get() — hit | 34,509,533 |
| get() — miss | 136,783,375 |
| delete() | 24,999 |
| increment() | 27,760,743 |

```ts
kv.set('k', 'v');           // 6.1M ops/s
kv.get('k');                // 34.5M ops/s
kv.delete('k');             // 25K ops/s
kv.increment('counter', 1); // 27.8M ops/s
```

### Proto

| Benchmark | proto | @coderbuzz/msgpack | JSON | @msgpack/msgpack | Winner |
|---|---|---|---|---|---|
| Encode (ops/s) | **3,974,629** | 3,646,308 | 6,952,693 | 1,464,844 | JSON.stringify |
| Decode (ops/s) | **3,007,406** | 1,439,044 | 3,468,298 | 1,112,222 | JSON.parse |
| Wire size | 139 B | **111 B** | 139 B | 111 B | msgpack libs (20% < JSON/proto) |

```ts
class ProtoCodec {
  static encode(obj: any) { return Buffer.from(JSON.stringify(obj)); }
  static decode(buf: Buffer) { return JSON.parse(buf.toString()); }
}
```

*ops/s higher is better, wire size smaller is better*

Machine-readable data at [`results/latest.json`](./results/latest.json).

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
