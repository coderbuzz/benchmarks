// Proto-style throughput benchmark
// @coderbuzz/proto npm package has workspace:* deps (needs fix)

class ProtoCodec {
  static encode(obj: any): Buffer {
    const json = JSON.stringify(obj);
    return Buffer.from(json, "utf-8");
  }

  static decode(buf: Buffer): any {
    const json = buf.toString("utf-8");
    return JSON.parse(json);
  }
}

import { encode as mpEncode, decode as mpDecode } from "@msgpack/msgpack";

const obj = {
  id: 42,
  name: "Alice",
  active: true,
  tags: ["admin", "user", "moderator"],
  metadata: { createdAt: new Date().toISOString(), score: 95.5 },
};

const json = JSON.stringify(obj);
const protoBuf = ProtoCodec.encode(obj);
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
console.log("  Proto Throughput Benchmark");
console.log("  (inline JSON-based — @coderbuzz/proto npm broken)");
console.log("══════════════════════════════════════");

console.log("\nEncode:");
bench("JSON.stringify",       () => JSON.stringify(obj));
bench("proto encode",         () => ProtoCodec.encode(obj));
bench("@msgpack/msgpack",     () => mpEncode(obj));

console.log("\nDecode:");
bench("JSON.parse",           () => JSON.parse(json));
bench("proto decode",         () => ProtoCodec.decode(protoBuf));
bench("@msgpack/msgpack",     () => mpDecode(mpBuf));

console.log("\nWire size:");
console.log(`  JSON:                ${(Buffer.from(json).length / 1024).toFixed(2)} KB`);
console.log(`  proto (JSON-based):  ${(Buffer.from(protoBuf).length / 1024).toFixed(2)} KB`);
console.log(`  @msgpack/msgpack:    ${(Buffer.from(mpBuf).length / 1024).toFixed(2)} KB`);
