import { object, number, string, boolean, array, optional, coerce } from "@coderbuzz/veta";
import { z } from "zod";
import * as yup from "yup";
import Joi from "joi";
import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const vetaSimple = object({
  name: string({ min: 2, max: 100 }),
  age: number({ min: 0, max: 150 }),
  active: boolean(),
});

const zodSimple = z.object({
  name: z.string().min(2).max(100),
  age: z.number().min(0).max(150),
  active: z.boolean(),
});

const yupSimple = yup.object({
  name: yup.string().min(2).max(100).required(),
  age: yup.number().min(0).max(150).required(),
  active: yup.boolean().required(),
});

const joiSimple = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  age: Joi.number().min(0).max(150).required(),
  active: Joi.boolean().required(),
});

const typeboxSimple = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 100 }),
  age: Type.Number({ minimum: 0, maximum: 150 }),
  active: Type.Boolean(),
});

const vetaComplex = object({
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

const yupComplex = yup.object({
  id: yup.number().transform((v) => (typeof v === "string" ? Number(v) : v)).required(),
  profile: yup.object({
    displayName: yup.string().min(2).required(),
    email: yup.string().matches(/@/).required(),
    tags: yup.array().of(yup.string().required()).required(),
    scores: yup.array().of(yup.number().transform((v) => (typeof v === "string" ? Number(v) : v)).required()).required(),
  }).required(),
  metadata: yup.object({
    createdAt: yup.string().required(),
    updatedAt: yup.string().optional(),
  }).required(),
});

const joiComplex = Joi.object({
  id: Joi.number().custom((v) => (typeof v === "string" ? Number(v) : v)).required(),
  profile: Joi.object({
    displayName: Joi.string().min(2).required(),
    email: Joi.string().pattern(/@/).required(),
    tags: Joi.array().items(Joi.string().required()).required(),
    scores: Joi.array().items(Joi.number().custom((v) => (typeof v === "string" ? Number(v) : v)).required()).required(),
  }).required(),
  metadata: Joi.object({
    createdAt: Joi.string().required(),
    updatedAt: Joi.string().optional(),
  }).required(),
});

const typeboxComplex = Type.Object({
  id: Type.Number(),
  profile: Type.Object({
    displayName: Type.String({ minLength: 2 }),
    email: Type.String({ pattern: "@" }),
    tags: Type.Array(Type.String()),
    scores: Type.Array(Type.Number()),
  }),
  metadata: Type.Object({
    createdAt: Type.String(),
    updatedAt: Type.Optional(Type.String()),
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

const SEP = "━".repeat(46);
console.log(`\x1b[36m${SEP}\x1b[0m`);
console.log(`  \x1b[1m\x1b[36m◈ Validation Benchmark (Veta vs Zod / Yup / Joi / TypeBox)\x1b[0m`);
console.log(`\x1b[36m${SEP}\x1b[0m`);

console.log("\nSimple object (name, age, active):");
bench("Veta", () => vetaSimple(simpleData));
bench("Zod", () => zodSimple.parse(simpleData));
bench("Yup", () => yupSimple.validateSync(simpleData));
bench("Joi", () => joiSimple.validate(simpleData));
bench("TypeBox", () => Value.Parse(typeboxSimple, simpleData));

console.log("\nComplex nested object with coercion:");
bench("Veta", () => vetaComplex(complexData));
bench("Zod", () => zodComplex.parse(complexData));
bench("Yup", () => yupComplex.validateSync(complexData));
bench("Joi", () => joiComplex.validate(complexData));
bench("TypeBox", () => Value.Parse(typeboxComplex, Value.Convert(typeboxComplex, complexData)));

console.log("\nError handling (invalid input):");
const invalid = { name: "A", age: -1, active: "yes" };
bench("Veta throws", () => { try { vetaSimple(invalid); } catch {} });
bench("Zod throws", () => { try { zodSimple.parse(invalid); } catch {} });
bench("Yup throws", () => { try { yupSimple.validateSync(invalid); } catch {} });
bench("Joi throws", () => { try { joiSimple.validate(invalid); } catch {} });
bench("TypeBox throws", () => { try { Value.Parse(typeboxSimple, invalid); } catch {} });
