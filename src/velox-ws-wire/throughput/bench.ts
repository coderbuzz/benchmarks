import {
  encodePing, encodePublish, encodeRequest,
  encodeResponse, encodeSubscribe, decode,
} from "@coderbuzz/velox-ws-wire";

const topic = "chat:room1";
const payload = JSON.stringify({ user: "alice", text: "Hello!" });
const corrId = 42;

const wirePing = encodePing();
const wirePublish = encodePublish(topic, payload);
const wireRequest = encodeRequest(corrId, payload);
const wireResponse = encodeResponse(corrId, payload);
const wireSubscribe = encodeSubscribe(topic);

const jsonPing = JSON.stringify({ type: "ping" });
const jsonPublish = JSON.stringify({ type: "publish", topic, payload });
const jsonRequest = JSON.stringify({ type: "request", corrId, payload });
const jsonResponse = JSON.stringify({ type: "response", corrId, payload });
const jsonSubscribe = JSON.stringify({ type: "subscribe", topic });

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
console.log(`  \x1b[1m\x1b[36m◈ Velox WS Wire Throughput Benchmark\x1b[0m`);
console.log(`  \x1b[2mBinary WS framing vs JSON encode/decode\x1b[0m`);
console.log(`\x1b[36m${SEP}\x1b[0m`);

console.log("\nPING:");
bench("wire encode", () => encodePing());
bench("JSON encode", () => JSON.stringify({ type: "ping" }));
bench("wire decode", () => decode(wirePing));
bench("JSON decode", () => JSON.parse(jsonPing));

console.log("\nPUBLISH (topic + payload):");
bench("wire encode", () => encodePublish(topic, payload));
bench("JSON encode", () => JSON.stringify({ type: "publish", topic, payload }));
bench("wire decode", () => decode(wirePublish));
bench("JSON decode", () => JSON.parse(jsonPublish));

console.log("\nREQUEST (corrId + payload):");
bench("wire encode", () => encodeRequest(corrId, payload));
bench("JSON encode", () => JSON.stringify({ type: "request", corrId, payload }));
bench("wire decode", () => decode(wireRequest));
bench("JSON decode", () => JSON.parse(jsonRequest));

console.log("\nRESPONSE (corrId + payload):");
bench("wire encode", () => encodeResponse(corrId, payload));
bench("JSON encode", () => JSON.stringify({ type: "response", corrId, payload }));
bench("wire decode", () => decode(wireResponse));
bench("JSON decode", () => JSON.parse(jsonResponse));

console.log("\nSUBSCRIBE (topic):");
bench("wire encode", () => encodeSubscribe(topic));
bench("JSON encode", () => JSON.stringify({ type: "subscribe", topic }));
bench("wire decode", () => decode(wireSubscribe));
bench("JSON decode", () => JSON.parse(jsonSubscribe));
