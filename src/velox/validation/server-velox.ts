import { AppServer, HttpError } from "@coderbuzz/velox";
import {
  array, boolean, coerce, literal, nullable, number,
  object, optional, string, union, VetaError
} from "@coderbuzz/veta";

const app = new AppServer({ port: 3000 });
// Velox does not depend on veta, so a failed schema is a 500 unless the app maps it (velox DOCS.md, "Validation → 400").
app.onError((error) => {
  if (error instanceof HttpError) return error.toResponse();
  if (error instanceof VetaError) return Response.json({ status: 400, message: error.message, path: error.path }, { status: 400 });
  console.error(error);
  return Response.json({ status: 500, message: "Internal Server Error" }, { status: 500 });
});
app.post("/hello/:par1/:par2", {
  json: object({
    someKey: optional(string()),
    someOtherKey: optional(number()),
    requiredKey: array(number({ integer: true }), { max: 3 }),
    nullableKey: nullable(number()),
    multipleTypesKey: union([boolean(), number()]),
    multipleRestrictedTypesKey: union([
      string({ max: 5 }),
      number({ min: 10 }),
    ]),
    enumKey: union([literal("John"), literal("Foo")]),
  }),
  query: {
    name: optional(string()),
    excitement: optional(string()),
  },
  params: {
    par1: optional(string()),
    par2: optional(coerce(number())),
  },
  headers: {
    // min: 1 also rejects an empty x-foo, not only a missing one.
    "x-foo": string({ min: 1 }),
  },
}, async (ctx) => {
  // Velox validates lazily, on first access. Touch every validated part so it does
  // the same work as the other frameworks, which validate all four eagerly.
  const { params, query, headers } = ctx;
  await ctx.json;
  return Response.json({ message: "Hello, World" });
});
app.run();
