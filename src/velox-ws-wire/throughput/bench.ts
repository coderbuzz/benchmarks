import { decode } from "@coderbuzz/velox-ws-wire";
import { Recorder, bench, expectOk, header, section } from "../../_lib/harness";
import { frames } from "../frames";

const rec = new Recorder("velox-ws-wire-throughput");
header("Velox WS Wire Throughput Benchmark", "binary WS framing vs JSON encode/decode");
const common = { library: "@coderbuzz/velox-ws-wire", group: "Velox WS Wire", type: "throughput", unit: "ops/s", higherIsBetter: true } as const;

for (const [id, label, wireEncode, jsonEncode] of frames) {
  const wireBuf = wireEncode();
  const json = jsonEncode();
  // Round-trip: every field except the numeric frame type must match the JSON frame.
  const { type: _, ...fields } = JSON.parse(json);
  expectOk(`${label} wire round-trip`, () => decode(wireBuf), (v: any) => {
    const { type, ...rest } = v ?? {};
    return typeof type === "number" && JSON.stringify(rest) === JSON.stringify(fields);
  });

  section(`${label}:`);
  const enc = rec.suite({ ...common, id: `velox-ws-wire-${id}-encode`, row: `${label} encode`,
    description: `${label} frame encode: binary wire vs JSON.stringify${id === "ping" ? " (encodePing() returns a shared pre-built buffer: measures call overhead only)" : ""}`, code: wireEncode.toString().replace(/^\(\) => /, "") });
  enc.add("@coderbuzz/velox-ws-wire", bench("wire encode", wireEncode));
  enc.add("JSON", bench("JSON encode", jsonEncode));

  const dec = rec.suite({ ...common, id: `velox-ws-wire-${id}-decode`, row: `${label} decode`,
    description: `${label} frame decode: binary wire vs JSON.parse`, code: "decode(buf)" });
  dec.add("@coderbuzz/velox-ws-wire", bench("wire decode", () => decode(wireBuf)));
  dec.add("JSON", bench("JSON decode", () => JSON.parse(json)));
}

rec.save();
