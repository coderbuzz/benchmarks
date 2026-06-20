import { KVStore } from "@coderbuzz/kvs";
import { createServer } from "@coderbuzz/kvs-server";
import type { AppServer } from "@coderbuzz/velox";

const TOKEN = "bench-token";
const SEP = "━".repeat(46);

function fmtPct(part: number, total: number): string {
  return `(${(part / total * 100).toFixed(1)}% of direct)`;
}

const store = new KVStore(":memory:");
store.set(["direct-key"], "bench-value");

const server: AppServer<{}> = createServer(store, {
  port: 0,
  hostname: "localhost",
  accessToken: TOKEN,
});
const { port } = await server.run();
const baseUrl = `http://localhost:${port}`;
const wsUrl = `ws://localhost:${port}/ws?token=${TOKEN}`;

async function benchNetwork(label: string, fn: () => Promise<void>, opsRef: number) {
  const warmup = Math.min(100, opsRef > 0 ? Math.max(10, Math.round(opsRef / 1000)) : 50);
  const iters = Math.max(50, Math.min(2000, Math.round(opsRef / 20)));
  for (let i = 0; i < Math.min(warmup, iters); i++) await fn();
  const start = performance.now();
  for (let i = 0; i < iters; i++) await fn();
  const elapsed = performance.now() - start;
  const ops = Math.round((iters / elapsed) * 1000);
  const pct = opsRef > 0 ? fmtPct(ops, opsRef) : "";
  console.log(`  ${label}: ${ops.toLocaleString()} ops/s  ${pct}`);
}

const authHeaders = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function httpSet() {
  await fetch(`${baseUrl}/kv/set`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ key: ["k"], value: "v" }),
  });
}

async function httpGet() {
  await fetch(`${baseUrl}/kv/get`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ key: ["direct-key"] }),
  });
}

// WS setup
const ws = new WebSocket(wsUrl);
await new Promise<void>((resolve) => {
  ws.onopen = () => resolve();
  ws.onerror = (e) => { console.error("WS error", e); resolve(); };
});

let msgId = 0;
const resolvers = new Map<number, (v: any) => void>();
ws.onmessage = (event: MessageEvent) => {
  const msg = JSON.parse(event.data as string);
  const resolve = resolvers.get(msg.id);
  if (resolve) {
    resolvers.delete(msg.id);
    resolve(msg.result ?? msg.error);
  }
};

function wsRpc(method: string, params: any): Promise<any> {
  const id = ++msgId;
  return new Promise((resolve) => {
    resolvers.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

// Warmup WS auth
await wsRpc("auth", { token: TOKEN });

console.log(`\x1b[36m${SEP}\x1b[0m`);
console.log(`  \x1b[1m\x1b[36m◈ KVS Server Transport Overhead Benchmark\x1b[0m`);
console.log(`  \x1b[2mKVS direct vs HTTP REST vs WS RPC\x1b[0m`);
console.log(`\x1b[36m${SEP}\x1b[0m`);

// --- Measure direct first ---
let setDirectOps: number, getDirectOps: number;

// set direct
store.set(["s"], 0);
{
  for (let i = 0; i < 1000; i++) store.set(["s"], "v");
  const t0 = performance.now();
  for (let i = 0; i < 50000; i++) store.set(["s"], "v");
  const elapsed = performance.now() - t0;
  setDirectOps = Math.round((50000 / elapsed) * 1000);
}

// get direct
store.set(["g"], 1);
{
  for (let i = 0; i < 1000; i++) store.get(["g"]);
  const t0 = performance.now();
  for (let i = 0; i < 50000; i++) store.get(["g"]);
  const elapsed = performance.now() - t0;
  getDirectOps = Math.round((50000 / elapsed) * 1000);
}

console.log("\nset('k','v'):");
console.log(`  KVS direct:      ${setDirectOps.toLocaleString()} ops/s`);
await benchNetwork("KVS HTTP REST", httpSet, setDirectOps);
await benchNetwork("KVS WS RPC", () => wsRpc("kv/set", { key: ["k"], value: "v" }), setDirectOps);

console.log("\nget('k') — hit:");
console.log(`  KVS direct:      ${getDirectOps.toLocaleString()} ops/s`);
await benchNetwork("KVS HTTP REST", httpGet, getDirectOps);
await benchNetwork("KVS WS RPC", () => wsRpc("kv/get", { key: ["direct-key"] }), getDirectOps);

// Cleanup
ws.close();
await server.stop();
store.close();
