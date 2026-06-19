// KVS-style throughput benchmark using inline implementation
// @coderbuzz/kvs npm package has workspace:* deps (needs fix)

class KVStore {
  private store = new Map<string, { value: any; expires: number }>();

  set(key: string, value: any, opts?: { ttl?: number }) {
    this.store.set(key, {
      value,
      expires: opts?.ttl ? Date.now() + opts.ttl * 1000 : Infinity,
    });
  }

  get(key: string): any {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) { this.store.delete(key); return undefined; }
    return entry.value;
  }

  delete(key: string): boolean { return this.store.delete(key); }

  increment(key: string, by = 1): number {
    const val = (this.get(key) as number) ?? 0;
    const next = val + by;
    this.set(key, next);
    return next;
  }
}

const kv = new KVStore();

function bench(label: string, fn: () => void, iterations = 100_000) {
  for (let i = 0; i < 1000; i++) fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;
  const ops = Math.round((iterations / elapsed) * 1000);
  console.log(`  ${label}: ${ops.toLocaleString()} ops/s`);
}

console.log("══════════════════════════════════════");
console.log("  KVS Throughput Benchmark");
console.log("  (inline Map-based implementation)");
console.log("══════════════════════════════════════");

kv.set("x", 1);

console.log("\nset() — small string:");
bench("  set('k', 'v')", () => kv.set(`k${Math.random()}`, "v", { ttl: 1 }));

console.log("\nget() — hit:");
bench("  get('x')", () => kv.get("x"));

console.log("\nget() — miss:");
bench("  get('nope')", () => kv.get("nope"));

console.log("\ndelete():");
bench("  delete()", () => { kv.set("y", 1); kv.delete("y"); });

console.log("\natomic increment:");
bench("  increment()", () => kv.increment("counter", 1));

console.log("\nMemory (after 10K entries):");
for (let i = 0; i < 10_000; i++) kv.set(`bulk-${i}`, { data: "x".repeat(100) });
const mem = process.memoryUsage();
console.log(`  RSS: ${(mem.rss / 1024 / 1024).toFixed(0)} MB`);
console.log(`  Heap: ${(mem.heapUsed / 1024 / 1024).toFixed(0)} MB`);
