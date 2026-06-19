import { object, number, string, boolean, array, optional, coerce } from "@coderbuzz/kyo";
import { z } from "zod";

const kyoSimple = object({
  name: string({ min: 2, max: 100 }),
  age: number({ min: 0, max: 150 }),
  active: boolean(),
});

const zodSimple = z.object({
  name: z.string().min(2).max(100),
  age: z.number().min(0).max(150),
  active: z.boolean(),
});

const kyoComplex = object({
  id: coerce(number()),
  profile: {
    displayName: string({ min: 2 }),
    email: string({ pattern: /@/ }),
    tags: [string()],
    scores: [coerce(number())],
  },
  metadata: {
    createdAt: string(),
    updatedAt: optional(string()),
  },
});

const zodComplex = z.object({
  id: z.coerce.number(),
  profile: z.object({
    displayName: z.string().min(2),
    email: z.string().regex(/@/),
    tags: z.array(z.string()),
    scores: z.array(z.coerce.number()),
  }),
  metadata: z.object({
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  }),
});

const simpleData = { name: "Alice", age: 30, active: true };
const complexData = {
  id: "42",
  profile: {
    displayName: "Alice",
    email: "alice@example.com",
    tags: ["admin", "user"],
    scores: ["95", "87", "100"],
  },
  metadata: { createdAt: "2024-01-01", updatedAt: "2024-06-01" },
};

function bench(label: string, fn: () => void, iterations = 100_000) {
  for (let i = 0; i < 1000; i++) fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;
  const ops = Math.round((iterations / elapsed) * 1000);
  console.log(`  ${label}: ${ops.toLocaleString()} ops/s (${elapsed.toFixed(1)}ms for ${iterations.toLocaleString()} runs)`);
}

console.log("══════════════════════════════════════");
console.log("  Kyo vs Zod Validation Benchmark");
console.log("══════════════════════════════════════");

console.log("\nSimple object (name, age, active):");
bench("Kyo", () => kyoSimple(simpleData));
bench("Zod", () => zodSimple.parse(simpleData));

console.log("\nComplex nested object with coercion:");
bench("Kyo", () => kyoComplex(complexData));
bench("Zod", () => zodComplex.parse(complexData));

console.log("\nError handling (invalid input):");
const invalid = { name: "A", age: -1, active: "yes" };
bench("Kyo throws", () => { try { kyoSimple(invalid); } catch {} });
bench("Zod throws", () => { try { zodSimple.parse(invalid); } catch {} });
