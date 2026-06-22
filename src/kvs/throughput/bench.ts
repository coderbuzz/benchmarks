import { KVStore, AsyncKVStore } from "@coderbuzz/kvs";
import { SQL } from "bun";

const PG_URL = `postgres://${process.env.PG_USER ?? "testuser"}:${process.env.PG_PASS ?? "testpw"}@${process.env.PG_HOST ?? "localhost"}:${process.env.PG_PORT ?? 5432}/${process.env.PG_DB ?? "sql_test"}`;

async function isPostgresUp(): Promise<boolean> {
  try {
    const sql = new SQL(PG_URL);
    await sql`SELECT 1`;
    await sql.close();
    return true;
  } catch { return false; }
}

function benchSync(label: string, fn: () => void, iterations = 50_000) {
  for (let i = 0; i < 1000; i++) fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;
  console.log(`  ${label}: ${Math.round((iterations / elapsed) * 1000).toLocaleString()} ops/s`);
}

async function benchAsync(label: string, fn: () => Promise<unknown>, iterations = 20_000) {
  for (let i = 0; i < 500; i++) await fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) await fn();
  const elapsed = performance.now() - start;
  console.log(`  ${label}: ${Math.round((iterations / elapsed) * 1000).toLocaleString()} ops/s`);
}

const SEP = "━".repeat(46);

async function main() {
  const syncStore = new KVStore(":memory:");
  const asyncSqlite = new AsyncKVStore(":memory:");
  const pgUp = await isPostgresUp();
  let asyncPg: AsyncKVStore | null = null;
  if (pgUp) {
    asyncPg = new AsyncKVStore(PG_URL);
    await asyncPg.reset();
  }

  console.log(`\x1b[36m${SEP}\x1b[0m`);
  console.log(`  \x1b[1m\x1b[36m◈ KVS Throughput Benchmark\x1b[0m`);
  console.log(`  \x1b[2m@coderbuzz/kvs — bun:sqlite · Async SQLite · Async PostgreSQL\x1b[0m`);
  console.log(`\x1b[36m${SEP}\x1b[0m`);

  console.log(`\n  \x1b[1m── bun:sqlite ──\x1b[0m`);

  console.log("\nset('k', 'v'):");
  benchSync("  set", () => syncStore.set(["k"], "v"));

  console.log("\nget() — hit:");
  syncStore.set(["x"], 1);
  benchSync("  get", () => syncStore.get(["x"]));

  console.log("\nget() — miss:");
  benchSync("  miss", () => syncStore.get(["nope"]));

  console.log("\ndelete():");
  for (let i = 0; i < 500; i++) syncStore.set(["del-" + i], i);
  let di = 0;
  const maxDi = 500;
  benchSync("  delete", () => {
    syncStore.delete(["del-" + di]);
    di = (di + 1) % maxDi;
  });

  console.log("\nincrement():");
  syncStore.set(["counter"], 0);
  benchSync("  increment", () => {
    const entry = syncStore.get(["counter"]);
    syncStore.set(["counter"], ((entry?.value as number) ?? 0) + 1);
  });

  console.log(`\n  \x1b[1m── Async SQLite ──\x1b[0m`);

  console.log("\nset('k', 'v'):");
  await benchAsync("  set", () => asyncSqlite.set(["k"], "v"));

  console.log("\nget() — hit:");
  await asyncSqlite.set(["x"], 1);
  await benchAsync("  get", () => asyncSqlite.get(["x"]));

  console.log("\nget() — miss:");
  await benchAsync("  miss", () => asyncSqlite.get(["nope"]));

  console.log("\ndelete():");
  for (let i = 0; i < 500; i++) await asyncSqlite.set(["del-" + i], i);
  let di2 = 0;
  const maxDi2 = 500;
  await benchAsync("  delete", async () => {
    await asyncSqlite.delete(["del-" + di2]);
    di2 = (di2 + 1) % maxDi2;
  });

  console.log("\nincrement():");
  await asyncSqlite.set(["counter"], 0);
  await benchAsync("  increment", async () => {
    const entry = await asyncSqlite.get(["counter"]);
    await asyncSqlite.set(["counter"], ((entry?.value as number) ?? 0) + 1);
  });

  if (asyncPg) {
    const pg = asyncPg;
    console.log(`\n  \x1b[1m── Async PostgreSQL ──\x1b[0m`);

    console.log("\nset('k', 'v'):");
    await benchAsync("  set", () => pg.set(["k"], "v"));

    console.log("\nget() — hit:");
    await pg.set(["x"], 1);
    await benchAsync("  get", () => pg.get(["x"]));

    console.log("\nget() — miss:");
    await benchAsync("  miss", () => pg.get(["nope"]));

    console.log("\ndelete():");
    for (let i = 0; i < 500; i++) await pg.set(["del-" + i], i);
    let di3 = 0;
    const maxDi3 = 500;
    await benchAsync("  delete", async () => {
      await pg.delete(["del-" + di3]);
      di3 = (di3 + 1) % maxDi3;
    });

    console.log("\nincrement():");
    await pg.set(["counter"], 0);
    await benchAsync("  increment", async () => {
      const entry = await pg.get(["counter"]);
      await pg.set(["counter"], ((entry?.value as number) ?? 0) + 1);
    });
  } else {
    console.log(`\n  \x1b[33m⚠ PostgreSQL not available — skipping\x1b[0m`);
  }

  syncStore.close();
  await asyncSqlite.close();
  if (asyncPg) await asyncPg.close();
}

main().catch(console.error);
