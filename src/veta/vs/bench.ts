import * as veta from "@coderbuzz/veta";
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
// Two valid inputs, alternated per call: with one constant input the JIT may hoist a pure check out of the loop.
const simpleInputs = [simpleData, { name: "Bob", age: 41, active: false }];
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

// Feature-detected: is() and safeParse(..., { maxIssues }) exist from veta 0.6. Older versions fall back to
// try/catch around the throwing validator (check) or read the thrown error's message (first issue).
const vetaIs: ((v: any, x: unknown) => boolean) | undefined = (veta as any).is;
const vetaSafeParse: ((v: any, x: unknown, ctx?: unknown, o?: { maxIssues?: number }) => any) | undefined = (veta as any).safeParse;
const FIRST = { maxIssues: 1 };
// is() itself when present, so Veta is called as directly as TypeBox's Check.
const vetaCheck = vetaIs ?? ((v: any, x: unknown) => { try { v(x); return true; } catch { return false; } });
const vetaFirst = (v: any, x: unknown) => {
  if (!vetaSafeParse) { try { v(x); return ""; } catch (e: any) { return e.message; } }
  const r = vetaSafeParse(v, x, undefined, FIRST);
  return r.ok ? "" : r.issues[0].message;
};
const vetaCheckLabel = vetaIs ? "is(schema, x)" : "try { schema(x) } catch";
const vetaFirstLabel = vetaSafeParse ? "safeParse(schema, x, undefined, { maxIssues: 1 })" : "try { schema(x) } catch (e) { e.message }";

// Sanity for the added modes: valid accepted, invalid rejected, first issue is a non-empty message.
for (const x of simpleInputs) {
  if (vetaCheck(vetaSimple, x) !== true || typeboxSimple.Check(x) !== true || !zodSimple.safeParse(x).success) throw new Error("[sanity] valid input rejected");
  if (!yupSimple.isValidSync(x) || joiSimple.validate(x).error !== undefined) throw new Error("[sanity] valid input rejected");
}
if (vetaCheck(vetaSimple, simpleData) !== true || vetaCheck(vetaSimple, invalid) !== false) throw new Error("[sanity] Veta check mode");
if (typeboxSimple.Check(simpleData) !== true || typeboxSimple.Check(invalid) !== false) throw new Error("[sanity] TypeBox Check");
if (!yupSimple.isValidSync(simpleData) || yupSimple.isValidSync(invalid)) throw new Error("[sanity] Yup isValidSync");
if (!zodSimple.safeParse(simpleData).success || zodSimple.safeParse(invalid).success) throw new Error("[sanity] Zod safeParse");
if (joiSimple.validate(simpleData).error !== undefined || joiSimple.validate(invalid).error === undefined) throw new Error("[sanity] Joi validate");
if (vetaFirst(vetaSimple, simpleData) !== "" || !vetaFirst(vetaSimple, invalid)) throw new Error("[sanity] Veta first issue");
if (!typeboxSimple.Errors(invalid)[0]?.message) throw new Error("[sanity] TypeBox Errors()[0]");

const rec = new Recorder("veta-vs");
header("Validation Benchmark", "Veta vs Zod / Yup / Joi / TypeBox");

section("Simple object (name, age, active):");
const simple = rec.suite({
  id: "veta-simple", group: "Veta", row: "Simple validation", library: "@coderbuzz/veta", type: "throughput",
  description: "Simple object validation: { name: string, age: number, active: boolean }",
  code: "object({ name: string({ min: 2, max: 100 }), age: number({ min: 0, max: 150 }), active: boolean() })",
  unit: "ops/s", higherIsBetter: true,
});
simple.add("@coderbuzz/veta", bench("Veta", (i) => vetaSimple(simpleInputs[i & 1])));
simple.add("Zod", bench("Zod", (i) => zodSimple.parse(simpleInputs[i & 1])));
simple.add("Yup", bench("Yup", (i) => yupSimple.validateSync(simpleInputs[i & 1])));
simple.add("Joi", bench("Joi", (i) => joiSimple.validate(simpleInputs[i & 1])));
simple.add("TypeBox", bench("TypeBox (Compile)", (i) => typeboxSimple.Parse(simpleInputs[i & 1])));

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

section("Boolean check (valid input, no result object):");
const check = rec.suite({
  id: "veta-check", group: "Veta", row: "Check (boolean)", library: "@coderbuzz/veta", type: "throughput",
  description: `Valid/invalid decision only, simple object. Veta uses ${vetaCheckLabel} (feature-detected: is() from veta 0.6, older versions try/catch); Zod safeParse().success, Yup isValidSync, Joi validate().error, TypeBox Check. Input is valid: two objects, alternated per call.`,
  code: `${vetaCheckLabel} vs safeParse(x).success`,
  unit: "ops/s", higherIsBetter: true,
});
check.add("@coderbuzz/veta", bench("Veta " + vetaCheckLabel, (i) => vetaCheck(vetaSimple, simpleInputs[i & 1])));
check.add("Zod", bench("Zod safeParse", (i) => zodSimple.safeParse(simpleInputs[i & 1]).success));
check.add("Yup", bench("Yup isValidSync", (i) => yupSimple.isValidSync(simpleInputs[i & 1])));
check.add("Joi", bench("Joi validate", (i) => joiSimple.validate(simpleInputs[i & 1]).error === undefined));
check.add("TypeBox", bench("TypeBox Check", (i) => typeboxSimple.Check(simpleInputs[i & 1])));

section("First issue only (invalid input):");
const first = rec.suite({
  id: "veta-error-first", group: "Veta", row: "Error, first issue", library: "@coderbuzz/veta", type: "throughput",
  description: `Invalid input, read the first issue message only. Veta uses ${vetaFirstLabel}; Zod has no first-error mode and runs a full safeParse; Yup validateSync and Joi validate stop at the first error by default; TypeBox Errors()[0]`,
  code: vetaFirstLabel,
  unit: "ops/s", higherIsBetter: true,
});
first.add("@coderbuzz/veta", bench("Veta first issue", () => vetaFirst(vetaSimple, invalid)));
first.add("Zod", bench("Zod safeParse", () => zodSimple.safeParse(invalid).error!.issues[0]!.message));
first.add("Yup", bench("Yup validateSync", () => { try { yupSimple.validateSync(invalid); } catch (e: any) { return e.message; } }));
first.add("Joi", bench("Joi validate", () => joiSimple.validate(invalid).error!.message));
first.add("TypeBox", bench("TypeBox Errors", () => typeboxSimple.Errors(invalid)[0]!.message));

rec.save();
