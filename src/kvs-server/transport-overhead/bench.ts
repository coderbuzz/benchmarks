import { KVStore } from "@coderbuzz/kvs";
import { createServer } from "@coderbuzz/kvs-server";
import { Recorder, bench, benchAsync, header, section } from "../../_lib/harness";

const TOKEN = "bench-token";

const store = new KVStore(":memory:");
store.set(["direct-key"], "bench-value");

const server = createServer(store, {
  port: 0,
  hostname: "127.0.0.1",
  accessToken: TOKEN,
});
const { port } = await server.run();
const baseUrl = `http://127.0.0.1:${port}`;
const wsUrl = `ws://127.0.0.1:${port}/ws?token=${TOKEN}`;

const authHeaders = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

// Bodies are always consumed (keep-alive reuse) and every response is checked:
// a benchmark that measures 401s or "Unknown method" errors is meaningless.
async function http(path: string, body: unknown) {
  const res = await fetch(`${baseUrl}${path}`, { method: "POST", headers: authHeaders, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${path} → ${res.status}: ${text}`);
  return text;
}

// --- WS JSON-RPC (token in the query string authenticates the socket) ---
const ws = new WebSocket(wsUrl);
await new Promise<void>((resolve, reject) => {
  ws.onopen = () => resolve();
  ws.onerror = () => reject(new Error("WS connection failed"));
});

let msgId = 0;
const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
ws.onmessage = (event: MessageEvent) => {
  const msg = JSON.parse(event.data as string);
  const p = pending.get(msg.id);
  if (!p) return;
  pending.delete(msg.id);
  if (msg.error) p.reject(new Error(`WS RPC error: ${msg.error}`));
  else p.resolve(msg.result);
};

function wsRpc(method: string, params: unknown): Promise<unknown> {
  const id = ++msgId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

// Sanity
const httpHit = JSON.parse(await http("/kv/get", { key: ["direct-key"] }));
if (httpHit?.entry?.value !== "bench-value") throw new Error(`[sanity] HTTP get: ${JSON.stringify(httpHit)}`);
const wsHit: any = await wsRpc("/kv/get", { key: ["direct-key"] });
if (wsHit?.entry?.value !== "bench-value") throw new Error(`[sanity] WS get: ${JSON.stringify(wsHit)}`);

const rec = new Recorder("kvs-server");
header("KVS Server Transport Overhead Benchmark", "KVS direct vs WS RPC vs HTTP REST (sequential, 1 client)");
const common = { library: "@coderbuzz/kvs-server", group: "KVS Server", type: "throughput", unit: "ops/s", higherIsBetter: true } as const;

section("set('k', 'v'):");
const set = rec.suite({ ...common, id: "kvs-server-set", row: "set('k','v')",
  description: "set(k, v) throughput: KVS direct vs WS RPC vs HTTP REST",
  code: "store.set(['k'], 'v') | wsRpc('/kv/set', ...) | fetch(POST /kv/set)" });
set.add("KVS direct", bench("KVS direct", () => store.set(["k"], "v")));
set.add("WS RPC", await benchAsync("WS RPC", () => wsRpc("/kv/set", { key: ["k"], value: "v" })));
set.add("HTTP REST", await benchAsync("HTTP REST", () => http("/kv/set", { key: ["k"], value: "v" })));

section("get('k') hit:");
const get = rec.suite({ ...common, id: "kvs-server-get", row: "get('k') hit",
  description: "get(k) throughput: KVS direct vs WS RPC vs HTTP REST",
  code: "store.get(['k']) | wsRpc('/kv/get', ...) | fetch(POST /kv/get)" });
get.add("KVS direct", bench("KVS direct", () => store.get(["direct-key"])));
get.add("WS RPC", await benchAsync("WS RPC", () => wsRpc("/kv/get", { key: ["direct-key"] })));
get.add("HTTP REST", await benchAsync("HTTP REST", () => http("/kv/get", { key: ["direct-key"] })));

ws.close();
await server.stop();
store.close();
rec.save();
