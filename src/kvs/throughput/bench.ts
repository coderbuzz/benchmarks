import { KVStore, AsyncKVStore } from "@coderbuzz/kvs";
import { SQL } from "bun";
import { Recorder, bench, benchAsync, color, expectOk, header, section } from "../../_lib/harness";

const PG_URL = `postgres://${process.env.PG_USER ?? "testuser"}:${process.env.PG_PASS ?? "testpw"}@${process.env.PG_HOST ?? "localhost"}:${process.env.PG_PORT ?? 5432}/${process.env.PG_DB ?? "sql_test"}`;

async function isPostgresUp(): Promise<boolean> {
  try {
    const sql = new SQL(PG_URL);
    await sql`SELECT 1`;
    await sql.close();
    return true;
  } catch { return false; }
}

// Delete benchmarks remove keys that exist: each round re-populates exactly as many
// keys as it deletes (outside the timed region). Iteration counts are fixed per backend.
const DELETE_ITERATIONS = { sync: 50_000, sqlite: 20_000, pg: 5_000 };

const rec = new Recorder("kvs");
const OPS = [
  ["set", "set('k', 'v')", "store.set(['k'], 'v')"],
  ["get-hit", "get() hit", "store.get(['x'])"],
  ["get-miss", "get() miss", "store.get(['nope'])"],
  ["delete", "delete()", "store.delete(['del', i])  // key exists"],
  ["increment", "increment()", "store.increment(['counter'])  // atomic, built-in"],
] as const;
const suites = Object.fromEntries(OPS.map(([id, row, code]) => [id, rec.suite({
  id: `kvs-${id}`, group: "KVS", row, library: "@coderbuzz/kvs", type: "throughput",
  description: `${row} throughput per backend: KVStore (bun:sqlite, sync) · AsyncKVStore (SQLite) · AsyncKVStore (PostgreSQL)`,
  code, unit: "ops/s", higherIsBetter: true,
})])) as Record<(typeof OPS)[number][0], ReturnType<typeof rec.suite>>;

async function main() {
  header("KVS Throughput Benchmark", "@coderbuzz/kvs: bun:sqlite · Async SQLite · Async PostgreSQL");

  // --- bun:sqlite (sync) ---
  const syncStore = new KVStore(":memory:");
  syncStore.set(["x"], 1);
  expectOk("sync get hit", () => syncStore.get(["x"]), (e: any) => e?.value === 1);
  expectOk("sync get miss", () => syncStore.get(["nope"]), (e: any) => !e || e.value == null);
  syncStore.set(["del", 0], 0);
  syncStore.delete(["del", 0]);
  expectOk("sync delete", () => syncStore.get(["del", 0]), (e: any) => !e || e.value == null);

  section("── bun:sqlite (KVStore) ──");
  const SYNC = "bun:sqlite";
  suites.set.add(SYNC, bench("set", () => syncStore.set(["k"], "v")));
  suites["get-hit"].add(SYNC, bench("get hit", () => syncStore.get(["x"])));
  suites["get-miss"].add(SYNC, bench("get miss", () => syncStore.get(["nope"])));
  suites.delete.add(SYNC, bench("delete", (i) => syncStore.delete(["del", i]), {
    iterations: DELETE_ITERATIONS.sync,
    beforeRound: (n) => { for (let i = 0; i < n; i++) syncStore.set(["del", i], i); },
  }));
  syncStore.set(["counter"], 0);
  expectOk("sync increment", () => syncStore.increment(["counter"]), (n) => n === 1);
  suites.increment.add(SYNC, bench("increment", () => syncStore.increment(["counter"])));
  syncStore.close();

  // --- async backends ---
  const backends: [string, string, AsyncKVStore, number][] = [
    ["Async SQLite", "── Async SQLite (AsyncKVStore) ──", new AsyncKVStore(":memory:"), DELETE_ITERATIONS.sqlite],
  ];
  if (await isPostgresUp()) {
    const pg = new AsyncKVStore(PG_URL);
    await pg.reset();
    backends.push(["Async PostgreSQL", "── Async PostgreSQL (AsyncKVStore) ──", pg, DELETE_ITERATIONS.pg]);
  }

  for (const [name, title, store, deleteIterations] of backends) {
    section(title);
    await store.set(["x"], 1);
    const hit = await store.get(["x"]);
    if ((hit as any)?.value !== 1) throw new Error(`[sanity] ${name} get hit returned ${JSON.stringify(hit)}`);
    const miss = await store.get(["nope"]);
    if (miss && (miss as any).value != null) throw new Error(`[sanity] ${name} get miss returned ${JSON.stringify(miss)}`);
    await store.set(["del", 0], 0);
    await store.delete(["del", 0]);
    if (((await store.get(["del", 0])) as any)?.value != null) throw new Error(`[sanity] ${name} delete left the key`);

    suites.set.add(name, await benchAsync("set", () => store.set(["k"], "v")));
    suites["get-hit"].add(name, await benchAsync("get hit", () => store.get(["x"])));
    suites["get-miss"].add(name, await benchAsync("get miss", () => store.get(["nope"])));
    suites.delete.add(name, await benchAsync("delete", (i) => store.delete(["del", i]), {
      iterations: deleteIterations,
      beforeRound: async (n) => { for (let i = 0; i < n; i++) await store.set(["del", i], i); },
    }));
    await store.set(["counter"], 0);
    const first = await store.increment(["counter"]);
    if (first !== 1) throw new Error(`[sanity] ${name} increment returned ${first}`);
    suites.increment.add(name, await benchAsync("increment", () => store.increment(["counter"])));
    await store.close();
  }
  if (backends.length === 1) console.log(`\n  ${color.yellow("⚠ PostgreSQL not available, skipping")}`);

  rec.save();
}

await main();
