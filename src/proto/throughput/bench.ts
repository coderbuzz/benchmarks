import { object, string, number, boolean, array } from "@coderbuzz/veta";
import { proto } from "@coderbuzz/proto";
import { encode as msgpackEncode, decode as msgpackDecode } from "@coderbuzz/msgpack";
import { encode as mpEncode, decode as mpDecode } from "@msgpack/msgpack";
import { Recorder, bench, expectOk, header, section } from "../../_lib/harness";

const schema = object({
  id: number(),
  name: string(),
  active: boolean(),
  tags: array(string()),
  metadata: object({
    createdAt: string(),
    score: number(),
  }),
});

const codec = proto(schema);
const obj = {
  id: 42,
  name: "Alice",
  active: true,
  tags: ["admin", "user", "moderator"],
  metadata: { createdAt: "2026-01-01T00:00:00.000Z", score: 95.5 },
};

const json = JSON.stringify(obj);
const protoBuf = codec.encode(obj);
const cbBuf = msgpackEncode(obj);
const mpBuf = mpEncode(obj);

const roundTrips = (v: unknown) => JSON.stringify(v) === json;
expectOk("proto round-trip", () => codec.decode(protoBuf), roundTrips);
expectOk("@coderbuzz/msgpack round-trip", () => msgpackDecode(cbBuf), roundTrips);
expectOk("@msgpack/msgpack round-trip", () => mpDecode(mpBuf), roundTrips);

const rec = new Recorder("proto");
header("Proto Throughput Benchmark", "schema-compiled binary codec vs msgpack vs JSON");
const common = { library: "@coderbuzz/proto", group: "Proto" } as const;

section("Encode:");
const enc = rec.suite({ ...common, id: "proto-encode", row: "Encode (ops/s)", type: "throughput",
  description: "Binary codec compiled from a veta schema (no field names, no tags)", code: "codec.encode(obj)", unit: "ops/s", higherIsBetter: true });
enc.add("@coderbuzz/proto", bench("proto encode", () => codec.encode(obj)));
enc.add("@coderbuzz/msgpack", bench("@coderbuzz/msgpack", () => msgpackEncode(obj)));
enc.add("JSON", bench("JSON.stringify", () => JSON.stringify(obj)));
enc.add("@msgpack/msgpack", bench("@msgpack/msgpack", () => mpEncode(obj)));

section("Decode:");
const dec = rec.suite({ ...common, id: "proto-decode", row: "Decode (ops/s)", type: "throughput",
  description: "Binary codec decode from a veta schema", code: "codec.decode(buf)", unit: "ops/s", higherIsBetter: true });
dec.add("@coderbuzz/proto", bench("proto decode", () => codec.decode(protoBuf)));
dec.add("@coderbuzz/msgpack", bench("@coderbuzz/msgpack", () => msgpackDecode(cbBuf)));
dec.add("JSON", bench("JSON.parse", () => JSON.parse(json)));
dec.add("@msgpack/msgpack", bench("@msgpack/msgpack", () => mpDecode(mpBuf)));

section("Wire size:");
const wire = rec.suite({ ...common, id: "proto-wire", row: "Wire size (bytes)", type: "wire-size",
  description: "Serialized byte size", code: "codec.encode(obj).length", unit: "bytes", higherIsBetter: false });
for (const [name, bytes] of [
  ["@coderbuzz/proto", protoBuf.length],
  ["@coderbuzz/msgpack", cbBuf.length],
  ["JSON", Buffer.byteLength(json)],
  ["@msgpack/msgpack", mpBuf.length],
] as const) {
  console.log(`  ${name.padEnd(28)} ${String(bytes).padStart(6)} B`);
  wire.add(name, bytes);
}

rec.save();
