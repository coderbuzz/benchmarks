import { boolean, coerce, date, number, object, string } from "@coderbuzz/veta";
import { z } from "zod";
import * as yup from "yup";
import Joi from "joi";
import Type from "typebox";
import { Compile } from "typebox/compile";
import { Recorder, bench, expectOk, header } from "../../_lib/harness";

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
  id: yup.number().required(),
  active: yup.boolean().required(),
  label: yup.string().transform((v) => String(v)).required(),
  born: yup.date().required(),
});

// TypeBox 1.x is JSON-Schema only (no Type.Date): Date comes from a Codec.
const typeboxSchema = Compile(Type.Object({
  id: Type.Number(),
  active: Type.Boolean(),
  label: Type.String(),
  born: Type.Codec(Type.String()).Decode((v) => new Date(v)).Encode((d) => d.toISOString()),
}));

const joiSchema = Joi.object({
  id: Joi.number().required(),
  active: Joi.boolean().required(),
  label: Joi.string().required(),
  born: Joi.date().required(),
}).prefs({ convert: true });

// Fresh object per call: TypeBox's Convert mutates its input in place.
const data = () => ({ id: "42", active: "true", label: 123 as unknown, born: "1990-01-15" });

const coerced = (r: any) =>
  r.id === 42 && r.active === true && r.label === "123" && r.born instanceof Date && !isNaN(r.born.getTime());

expectOk("Veta", () => vetaSchema(data()), coerced);
expectOk("Zod", () => zodSchema.parse(data()), coerced);
expectOk("Yup", () => yupSchema.validateSync(data()), coerced);
// Joi refuses to turn a number into a string, so it gets a string label.
expectOk("Joi", () => joiSchema.validate({ ...data(), label: "123" }), (r: any) => r.error === undefined && coerced(r.value));
expectOk("TypeBox", () => typeboxSchema.Decode(typeboxSchema.Convert(data())), coerced);

const rec = new Recorder("veta-coerce");
header("Coercion Benchmark", "string → number / boolean / string / date (5 libs)");

const s = rec.suite({
  id: "veta-coerce", group: "Veta", row: "Coercion", library: "@coderbuzz/veta", type: "throughput",
  description: "String to number/boolean/date coercion (fresh input object per call)",
  code: "object({ id: coerce(number()), active: coerce(boolean()), label: coerce(string()), born: coerce(date()) })",
  unit: "ops/s", higherIsBetter: true,
});
console.log();
s.add("@coderbuzz/veta", bench("Veta coerce()", () => vetaSchema(data())));
s.add("Zod", bench("Zod coerce", () => zodSchema.parse(data())));
s.add("Yup", bench("Yup cast", () => yupSchema.validateSync(data())));
s.add("Joi", bench("Joi convert", () => joiSchema.validate({ id: "42", active: "true", label: "123", born: "1990-01-15" })));
s.add("TypeBox", bench("TypeBox Convert+Decode", () => typeboxSchema.Decode(typeboxSchema.Convert(data()))));

rec.save();
