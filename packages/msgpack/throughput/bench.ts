/**
 * Msgpack encode/decode throughput benchmark.
 * Compares @coderbuzz/msgpack vs @msgpack/msgpack vs JSON.
 */

import { encode, decode } from "@coderbuzz/msgpack";
import { encode as mpEncode, decode as mpDecode } from "@msgpack/msgpack";

const obj = {
  id: 42,
  name: "Alice",
  active: true,
  tags: ["admin", "user", "moderator"],
  metadata: {
    createdAt: new Date().toISOString(),
    score: 95.5,
  },
  nested: {
    a: { b: { c: [1, 2, 3, 4, 5] } },
  },
};

const json = JSON.stringify(obj);
const buf = encode(obj);
const mpBuf = mpEncode(obj);

function bench(label: string, fn: () => void, iterations = 50_000) {
  for (let i = 0; i < 1000; i++) fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;
  const ops = Math.round((iterations / elapsed) * 1000);
  console.log(`  ${label}: ${ops.toLocaleString()} ops/s`);
}

console.log("══════════════════════════════════════");
console.log("  Msgpack Throughput Benchmark");
console.log("══════════════════════════════════════");

console.log("\nEncode:");
bench("JSON.stringify",  () => JSON.stringify(obj));
bench("msgpack encode",   () => encode(obj));
bench("@msgpack/msgpack", () => mpEncode(obj));

console.log("\nDecode:");
bench("JSON.parse",    () => JSON.parse(json));
bench("msgpack decode", () => decode(buf));
bench("@msgpack/msgpack", () => mpDecode(mpBuf));

console.log("\nWire size:");
console.log(`  JSON:                ${(Buffer.from(json).length / 1024).toFixed(2)} KB`);
console.log(`  msgpack:             ${(Buffer.from(buf).length / 1024).toFixed(2)} KB`);
console.log(`  @msgpack/msgpack:    ${(Buffer.from(mpBuf).length / 1024).toFixed(2)} KB`);
