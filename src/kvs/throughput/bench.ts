import { KVStore } from "@coderbuzz/kvs";

const kv = new KVStore(":memory:");

function bench(label: string, fn: () => void, iterations = 50_000) {
  for (let i = 0; i < 1000; i++) fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;
  const ops = Math.round((iterations / elapsed) * 1000);
  console.log(`  ${label}: ${ops.toLocaleString()} ops/s`);
}

const SEP = "━".repeat(46);
console.log(`\x1b[36m${SEP}\x1b[0m`);
console.log(`  \x1b[1m\x1b[36m◈ KVS Throughput Benchmark\x1b[0m`);
console.log(`  \x1b[2m@coderbuzz/kvs SQLite-backed\x1b[0m`);
console.log(`\x1b[36m${SEP}\x1b[0m`);

console.log("\nset('k', 'v'):");
bench("  set", () => kv.set(["k"], "v"));

console.log("\nget() — hit:");
kv.set(["x"], 1);
bench("  get", () => kv.get(["x"]));

console.log("\nget() — miss:");
bench("  miss", () => kv.get(["nope"]));

console.log("\ndelete():");
for (let i = 0; i < 500; i++) kv.set(["del-" + i], i);
let di = 0;
const maxDi = 500;
bench("  delete", () => {
  kv.delete(["del-" + di]);
  di = (di + 1) % maxDi;
});

console.log("\nincrement():");
kv.set(["counter"], 0);
bench("  increment", () => {
  const entry = kv.get(["counter"]);
  kv.set(["counter"], ((entry?.value as number) ?? 0) + 1);
});

kv.close();
