import { AppServer } from "@coderbuzz/velox";
import {
  array, boolean, coerce, literal, nullable, number,
  object, optional, string, union
} from "@coderbuzz/veta";

const app = new AppServer({ port: 3000 });
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
    // Velox 0.7 passes a missing header to the validator as "", so a bare string()
    // would accept a request without x-foo. min: 1 makes the header required.
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
