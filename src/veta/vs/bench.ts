import { object, number, string, boolean, optional, coerce } from "@coderbuzz/veta";
import { z } from "zod";
import * as yup from "yup";
import Joi from "joi";
import Type from "typebox";
import { Compile } from "typebox/compile";
import { Recorder, bench, expectFail, expectOk, header, section } from "../../_lib/harness";

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

const typeboxSimple = Compile(Type.Object({
  name: Type.String({ minLength: 2, maxLength: 100 }),
  age: Type.Number({ minimum: 0, maximum: 150 }),
  active: Type.Boolean(),
}));

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
  id: yup.number().required(),
  profile: yup.object({
    displayName: yup.string().min(2).required(),
    email: yup.string().matches(/@/).required(),
    tags: yup.array().of(yup.string().required()).required(),
    scores: yup.array().of(yup.number().required()).required(),
  }).required(),
  metadata: yup.object({
    createdAt: yup.string().required(),
    updatedAt: yup.string().optional(),
  }).required(),
});

const joiComplex = Joi.object({
  id: Joi.number().required(),
  profile: Joi.object({
    displayName: Joi.string().min(2).required(),
    email: Joi.string().pattern(/@/).required(),
    tags: Joi.array().items(Joi.string().required()).required(),
    scores: Joi.array().items(Joi.number().required()).required(),
  }).required(),
  metadata: Joi.object({
    createdAt: Joi.string().required(),
    updatedAt: Joi.string().optional(),
  }).required(),
});

const typeboxComplex = Compile(Type.Object({
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
}));

const simpleData = { name: "Alice", age: 30, active: true };
// Fresh object per call: TypeBox's Convert mutates its input, and a pre-coerced
// object would let every later library skip the coercion work.
const complexData = () => ({
  id: "42",
  profile: {
    displayName: "Alice",
    email: "alice@example.com",
    tags: ["admin", "user"],
    scores: ["95", "87", "100"],
  },
  metadata: { createdAt: "2024-01-01", updatedAt: "2024-06-01" },
});
const invalid = { name: "A", age: -1, active: "yes" };

const joiOk = (r: any) => r.error === undefined;
const joiErr = (r: any) => r.error !== undefined;
const coerced = (r: any) => r.id === 42 && r.profile.scores[0] === 95;

// Sanity: every library must accept valid input, coerce, and reject invalid input.
expectOk("Veta simple", () => vetaSimple(simpleData));
expectOk("Zod simple", () => zodSimple.parse(simpleData));
expectOk("Yup simple", () => yupSimple.validateSync(simpleData));
expectOk("Joi simple", () => joiSimple.validate(simpleData), joiOk);
expectOk("TypeBox simple", () => typeboxSimple.Parse(simpleData));
expectOk("Veta complex", () => vetaComplex(complexData()), coerced);
expectOk("Zod complex", () => zodComplex.parse(complexData()), coerced);
expectOk("Yup complex", () => yupComplex.validateSync(complexData()), coerced);
expectOk("Joi complex", () => joiComplex.validate(complexData()), (r: any) => joiOk(r) && coerced(r.value));
expectOk("TypeBox complex", () => typeboxComplex.Parse(typeboxComplex.Convert(complexData())), coerced);
expectFail("Veta invalid", () => vetaSimple(invalid));
expectFail("Zod invalid", () => zodSimple.parse(invalid));
expectFail("Yup invalid", () => yupSimple.validateSync(invalid));
expectFail("Joi invalid", () => joiSimple.validate(invalid), joiErr);
expectFail("TypeBox invalid", () => typeboxSimple.Parse(invalid));

const rec = new Recorder("veta-vs");
header("Validation Benchmark", "Veta vs Zod / Yup / Joi / TypeBox");

section("Simple object (name, age, active):");
const simple = rec.suite({
  id: "veta-simple", group: "Veta", row: "Simple validation", library: "@coderbuzz/veta", type: "throughput",
  description: "Simple object validation: { name: string, age: number, active: boolean }",
  code: "object({ name: string({ min: 2, max: 100 }), age: number({ min: 0, max: 150 }), active: boolean() })",
  unit: "ops/s", higherIsBetter: true,
});
simple.add("@coderbuzz/veta", bench("Veta", () => vetaSimple(simpleData)));
simple.add("Zod", bench("Zod", () => zodSimple.parse(simpleData)));
simple.add("Yup", bench("Yup", () => yupSimple.validateSync(simpleData)));
simple.add("Joi", bench("Joi", () => joiSimple.validate(simpleData)));
simple.add("TypeBox", bench("TypeBox (Compile)", () => typeboxSimple.Parse(simpleData)));

section("Complex nested object with coercion:");
const complex = rec.suite({
  id: "veta-complex", group: "Veta", row: "Complex validation", library: "@coderbuzz/veta", type: "throughput",
  description: "Complex nested object with string→number coercion (fresh input object per call)",
  code: "object({ id: coerce(number()), profile: { displayName: string(), email: string({ pattern: /@/ }), tags: [string()], scores: [coerce(number())] }, metadata: {...} })",
  unit: "ops/s", higherIsBetter: true,
});
complex.add("@coderbuzz/veta", bench("Veta", () => vetaComplex(complexData())));
complex.add("Zod", bench("Zod", () => zodComplex.parse(complexData())));
complex.add("Yup", bench("Yup", () => yupComplex.validateSync(complexData())));
complex.add("Joi", bench("Joi", () => joiComplex.validate(complexData())));
complex.add("TypeBox", bench("TypeBox (Compile)", () => typeboxComplex.Parse(typeboxComplex.Convert(complexData()))));

section("Error handling (invalid input):");
const error = rec.suite({
  id: "veta-error", group: "Veta", row: "Error handling", library: "@coderbuzz/veta", type: "throughput",
  description: "Invalid input rejection (throw + catch; Joi returns { error })",
  code: "try { schema(invalid) } catch {}",
  unit: "ops/s", higherIsBetter: true,
});
error.add("@coderbuzz/veta", bench("Veta throws", () => { try { vetaSimple(invalid); } catch {} }));
error.add("Zod", bench("Zod throws", () => { try { zodSimple.parse(invalid); } catch {} }));
error.add("Yup", bench("Yup throws", () => { try { yupSimple.validateSync(invalid); } catch {} }));
error.add("Joi", bench("Joi returns error", () => joiSimple.validate(invalid)));
error.add("TypeBox", bench("TypeBox throws", () => { try { typeboxSimple.Parse(invalid); } catch {} }));

rec.save();
