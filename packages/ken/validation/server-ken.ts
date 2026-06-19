import {
  AppServer, array, boolean, coerce, literal, nullable, number,
  object, optional, string, union
} from "@coderbuzz/ken";

new AppServer({ port: 3000 })
  .post("/hello/:par1/:par2", {
    json: object({
      someKey: optional(string()),
      someOtherKey: optional(number()),
      requiredKey: array(number(), { max: 3 }),
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
      "x-foo": string(),
    },
  }, async (ctx) => {
    await ctx.json;
    return Response.json({ message: "Hello, World" });
  })
  .run();
