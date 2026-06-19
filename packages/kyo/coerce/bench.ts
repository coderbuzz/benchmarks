/**
 * Coercion throughput benchmark: kyo coerce() vs zod coerce()
 */

import { boolean, coerce, date, number, object, string } from "@coderbuzz/kyo";
import { z } from "zod";

const kyoSchema = object({
  id: coerce(number()),
  active: coerce(boolean()),
  label: coerce(string()),
  born: coerce(date()),
});

const zodSchema = z.object({
  id: z.coerce.number(),
  active: z.coerce.boolean(),
  label: z.coerce.string(),
  born: z.coerce.date(),
});

const data = {
  id: "42",
  active: "true",
  label: 123,
  born: "1990-01-15",
};

function bench(label: string, fn: () => void, iterations = 50_000) {
  for (let i = 0; i < 1000; i++) fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;
  const ops = Math.round((iterations / elapsed) * 1000);
  console.log(`  ${label}: ${ops.toLocaleString()} ops/s`);
}

console.log("══════════════════════════════════════");
console.log("  Coercion Benchmark");
console.log("  string → number, boolean, etc.");
console.log("══════════════════════════════════════");

bench("Kyo coerce()", () => kyoSchema(data));
bench("Zod coerce", () => zodSchema.parse(data));
