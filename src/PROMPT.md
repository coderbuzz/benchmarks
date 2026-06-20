# Prompt: Add Missing Benchmarks

Run this prompt in OpenCode at the `coderbuzz/benchmarks` repo root.

---

Tambah benchmark untuk package berikut yang belum ada bench-nya.

## Aturan

1. Pakai Bun runtime.
2. Format benchmark: `src/<package>/<scenario>/bench.ts` (script) + `src/<package>/<scenario>/run.sh` (bash wrapper).
3. run.sh sederhana: echo header, lalu `bun src/<package>/<scenario>/bench.ts`, echo done.
4. bench.ts fungsi patokan:

```ts
function bench(label: string, fn: () => void, iterations = 50_000) {
  for (let i = 0; i < 1000; i++) fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;
  const ops = Math.round((iterations / elapsed) * 1000);
  console.log(`  ${label}: ${ops.toLocaleString()} ops/s`);
}
```

5. Kalau ada wire size comparison, pakai format tabel manual (`console.log`) seperti `src/msgpack/throughput/bench.ts`.
6. Hasil: hanya print ke stdout, tidak perlu tulis file.
7. Add competitor comparison (bukan cuma standalone).

---

## 1. `velox-ws-wire` — Binary WS framing codec

**Scenarios:** `throughput`, `wire-size`

### throughput

Encode/decode throughput untuk semua frame type:
- `encodePing()` / `decodePing()`
- `encodePublish(topic, payload)` / decode
- `encodeRequest(corrId, payload)` / decode
- `encodeResponse(corrId, payload)` / decode
- `encodeSubscribe(topic)` / decode

Competitors: JSON.stringify/parse sebagai baseline (encoding frame sebagai object JSON biasa vs wire format).

### wire-size

Ukur byte size tiap frame:
- PING: wire (1B) vs JSON (~18B)
- PUBLISH + topic pendek: wire vs JSON
- REQUEST + corrId: wire vs JSON
- ACK: wire vs JSON

Tabel per frame type.

---

## 2. `sql` — SQL toolkit (query compilation)

**Scenario:** `compile`

Ukur throughput query **compilation** saja (tanpa eksekusi DB).

Benchmark types:
1. SELECT simple: `db.select().from(users).where(eq(users.id, 1)).toSQL()`
2. SELECT JOIN: 2 tabel + ON clause
3. INSERT: single row
4. INSERT batch: 100 rows
5. CTE: WITH ... AS ... SELECT ...
6. SELECT dengan 10 nested conditions

Competitors:
- `drizzle-orm` (PostgreSQL dialect queries)
- `kysely` (PostgreSQL dialect)

Untuk tiap competitor, buat query equivalent dan compile ke SQL, ukur ops/s.

Format output per query type:

```
SELECT simple:
  @coderbuzz/sql:      1,234,567 ops/s
  drizzle-orm:           890,123 ops/s
  kysely:                756,789 ops/s
```

---

## 3. `kvs-server` — HTTP/WS overhead

**Scenario:** `transport-overhead`

Ukur overhead penambahan layer HTTP/WS di atas KVS direct.

Case:
1. KVS direct: `store.set(key, val)` + `store.get(key)` — tanpa server
2. KVS via HTTP REST: fetch POST/GET ke kvs-server
3. KVS via WebSocket RPC: koneksi WS, kirim set/get command

Competitors:
- `@coderbuzz/kvs` direct = baseline (100%)
- KVS sendiri sebagai pembanding

Butuh setup server dulu di bench.ts:
1. Start kvs-server di port random
2. Jalankan bench
3. Close server

Output:

```
set('k','v'):
  KVS direct:        198,720 ops/s
  KVS HTTP REST:      45,000 ops/s  (22.6% of direct)
  KVS WS RPC:         82,000 ops/s  (41.3% of direct)

get('k') — hit:
  KVS direct:      1,156,635 ops/s
  KVS HTTP REST:      62,000 ops/s  (5.4% of direct)
  KVS WS RPC:        105,000 ops/s  (9.1% of direct)
```

---

## Output files

```
src/velox-ws-wire/throughput/bench.ts
src/velox-ws-wire/throughput/run.sh
src/velox-ws-wire/wire-size/bench.ts
src/velox-ws-wire/wire-size/run.sh
src/sql/compile/bench.ts
src/sql/compile/run.sh
src/kvs-server/transport-overhead/bench.ts
src/kvs-server/transport-overhead/run.sh
```

Setelah semua file dibuat, update `README.md` tabel Packages + Latest Results, dan update `results/latest.json` dengan entry baru.
