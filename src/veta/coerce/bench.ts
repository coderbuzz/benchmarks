import { boolean, coerce, date, number, object, string } from "@coderbuzz/veta";
import { z } from "zod";
import * as yup from "yup";
import Joi from "joi";
import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const vetaSchema = object({
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

const yupSchema = yup.object({
  id: yup.number().transform((v) => (typeof v === "string" ? Number(v) : v)).required(),
  active: yup.boolean().transform((v) => {
    if (typeof v === "string") return v === "true" || v === "1";
    return Boolean(v);
  }).required(),
  label: yup.string().transform((v) => String(v)).required(),
  born: yup.date().transform((v) => (typeof v === "string" ? new Date(v) : v)).required(),
});

const typeboxSchema = Type.Object({
  id: Type.Number(),
  active: Type.Boolean(),
  label: Type.String(),
  born: Type.Date(),
});

const joiSchema = Joi.object({
  id: Joi.number().custom((v) => (typeof v === "string" ? Number(v) : v)).required(),
  active: Joi.boolean().custom((v) => {
    if (typeof v === "string") return v === "true" || v === "1";
    return Boolean(v);
  }).required(),
  label: Joi.string().custom((v) => String(v)).required(),
  born: Joi.date().custom((v) => (typeof v === "string" ? new Date(v) : v)).required(),
});

const data = { id: "42", active: "true", label: 123, born: "1990-01-15" };

function bench(label: string, fn: () => void, iterations = 50_000) {
  for (let i = 0; i < 1000; i++) fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;
  const ops = Math.round((iterations / elapsed) * 1000);
  console.log(`  ${label}: ${ops.toLocaleString()} ops/s`);
}

const SEP = "━".repeat(46);
console.log(`\x1b[36m${SEP}\x1b[0m`);
console.log(`  \x1b[1m\x1b[36m◈ Coercion Benchmark\x1b[0m`);
console.log(`  \x1b[2mstring → number, boolean, date, etc. (5 libs)\x1b[0m`);
console.log(`\x1b[36m${SEP}\x1b[0m`);

bench("Veta coerce()", () => vetaSchema(data));
bench("Zod coerce", () => zodSchema.parse(data));
bench("Yup coerce", () => yupSchema.validateSync(data));
bench("Joi coerce", () => joiSchema.validate(data));
bench("TypeBox coerce", () => Value.Parse(typeboxSchema, Value.Convert(typeboxSchema, data)));
