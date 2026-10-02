import { encode, decode } from "@coderbuzz/msgpack";
import { encode as mpEncode, decode as mpDecode } from "@msgpack/msgpack";
import { Recorder, bench, expectOk, header, section } from "../../_lib/harness";

const obj = {
  id: 42,
  name: "Alice",
  active: true,
  tags: ["admin", "user", "moderator"],
  metadata: {
    createdAt: "2026-01-01T00:00:00.000Z",
    score: 95.5,
  },
  nested: { a: { b: { c: [1, 2, 3, 4, 5] } } },
};

// JSON is only the round-trip reference here, not a contender: JSON.stringify returns a string
// built natively by the engine, msgpack encoders return bytes built in JS (not like with like).
const json = JSON.stringify(obj);
const buf = encode(obj);
const mpBuf = mpEncode(obj);

const roundTrips = (v: unknown) => JSON.stringify(v) === json;
expectOk("@coderbuzz/msgpack round-trip", () => decode(buf), roundTrips);
expectOk("@msgpack/msgpack round-trip", () => mpDecode(mpBuf), roundTrips);
expectOk("cross-decode", () => mpDecode(buf), roundTrips);

const rec = new Recorder("msgpack");
header("Msgpack Throughput Benchmark", "nested object encode / decode + wire size (msgpack libraries only)");
const common = { library: "@coderbuzz/msgpack", group: "Msgpack" } as const;

section("Encode:");
const enc = rec.suite({ ...common, id: "msgpack-encode", row: "Encode (ops/s)", type: "throughput",
  description: "Nested object to msgpack bytes", code: "encode(obj)", unit: "ops/s", higherIsBetter: true });
enc.add("@coderbuzz/msgpack", bench("@coderbuzz/msgpack", () => encode(obj)));
enc.add("@msgpack/msgpack", bench("@msgpack/msgpack", () => mpEncode(obj)));

section("Decode:");
const dec = rec.suite({ ...common, id: "msgpack-decode", row: "Decode (ops/s)", type: "throughput",
  description: "Msgpack bytes to object", code: "decode(buf)", unit: "ops/s", higherIsBetter: true });
dec.add("@coderbuzz/msgpack", bench("@coderbuzz/msgpack", () => decode(buf)));
dec.add("@msgpack/msgpack", bench("@msgpack/msgpack", () => mpDecode(mpBuf)));

section("Wire size:");
const wire = rec.suite({ ...common, id: "msgpack-wire", row: "Wire size (bytes)", type: "wire-size",
  description: "Serialized byte size for nested object", code: "encode(obj).length", unit: "bytes", higherIsBetter: false });
for (const [name, bytes] of [
  ["@coderbuzz/msgpack", buf.length],
  ["@msgpack/msgpack", mpBuf.length],
] as const) {
  console.log(`  ${name.padEnd(28)} ${String(bytes).padStart(6)} B`);
  wire.add(name, bytes);
}

rec.save();
