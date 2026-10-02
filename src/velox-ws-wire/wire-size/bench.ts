import { Recorder, header } from "../../_lib/harness";
import { frames } from "../frames";

const rec = new Recorder("velox-ws-wire-size");
header("Velox WS Wire Size Comparison", "wire format vs JSON frame size");

console.log(`\n  ┌──────────────────────┬──────────┬──────────┬──────────┐`);
console.log(`  │ Frame Type           │     Wire │     JSON │    Saved │`);
console.log(`  ├──────────────────────┼──────────┼──────────┼──────────┤`);

for (const [id, label, wireEncode, jsonEncode] of frames) {
  const wireBytes = wireEncode().length;
  const jsonBytes = Buffer.byteLength(jsonEncode());
  const saved = ((1 - wireBytes / jsonBytes) * 100).toFixed(0);
  console.log(`  │ ${label.padEnd(20)} │ ${String(wireBytes).padStart(8)} │ ${String(jsonBytes).padStart(8)} │ ${saved.padStart(7)}% │`);
  const s = rec.suite({
    id: `velox-ws-wire-${id}-size`, group: "Velox WS Wire (size)", row: label,
    library: "@coderbuzz/velox-ws-wire", type: "wire-size",
    description: `${label} frame size: binary wire vs JSON`, code: wireEncode.toString().replace(/^\(\) => /, ""),
    unit: "bytes", higherIsBetter: false,
  });
  s.add("@coderbuzz/velox-ws-wire", wireBytes);
  s.add("JSON", jsonBytes);
}

console.log(`  └──────────────────────┴──────────┴──────────┴──────────┘`);
rec.save();
