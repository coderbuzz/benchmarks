import {
  encodePing, encodePublish, encodeRequest,
  encodeResponse, encodeSubscribe,
} from "@coderbuzz/velox-ws-wire";

const topic = "chat:room1";
const payload = JSON.stringify({ user: "alice", text: "Hello!" });
const corrId = 42;

const frames: [string, Uint8Array, () => string][] = [
  ["PING",            encodePing(),        () => JSON.stringify({ type: "ping" })],
  ["PUBLISH (short)", encodePublish(topic, payload), () => JSON.stringify({ type: "publish", topic, payload })],
  ["REQUEST",         encodeRequest(corrId, payload), () => JSON.stringify({ type: "request", corrId, payload })],
  ["RESPONSE",        encodeResponse(corrId, payload), () => JSON.stringify({ type: "response", corrId, payload })],
  ["SUBSCRIBE",       encodeSubscribe(topic), () => JSON.stringify({ type: "subscribe", topic })],
];

const SEP = "━".repeat(46);
console.log(`\x1b[36m${SEP}\x1b[0m`);
console.log(`  \x1b[1m\x1b[36m◈ Velox WS Wire Size Comparison\x1b[0m`);
console.log(`  \x1b[2mWire format vs JSON frame size\x1b[0m`);
console.log(`\x1b[36m${SEP}\x1b[0m`);

console.log(`\n  ┌──────────────────────┬──────────┬──────────┬──────────┐`);
console.log(`  │ Frame Type           │    Wire  │    JSON  │   Saved  │`);
console.log(`  ├──────────────────────┼──────────┼──────────┼──────────┤`);

for (const [label, wireBuf, jsonFn] of frames) {
  const wireBytes = Buffer.from(wireBuf).length;
  const jsonBytes = Buffer.from(jsonFn()).length;
  const saved = ((1 - wireBytes / jsonBytes) * 100).toFixed(0);
  console.log(`  │ ${label.padEnd(20)} │ ${String(wireBytes).padStart(8)} │ ${String(jsonBytes).padStart(8)} │ ${saved.padStart(7)}% │`);
}

console.log(`  └──────────────────────┴──────────┴──────────┴──────────┘`);
