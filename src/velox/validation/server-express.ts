import express from "express";
import { z } from "zod";

const app = express();
app.use(express.json());

const bodySchema = z.object({
  someKey: z.string().optional(),
  someOtherKey: z.number().optional(),
  requiredKey: z.array(z.number().int()).max(3),
  nullableKey: z.number().nullable(),
  multipleTypesKey: z.union([z.boolean(), z.number()]),
  multipleRestrictedTypesKey: z.union([
    z.string().max(5),
    z.number().min(10),
  ]),
  enumKey: z.union([z.literal("John"), z.literal("Foo")]),
});

const querySchema = z.object({
  name: z.string().optional(),
  excitement: z.string().optional(),
});

const paramsSchema = z.object({
  par1: z.string().optional(),
  par2: z.coerce.number().optional(),
});

const headersSchema = z.object({
  "x-foo": z.string(),
});

app.post("/hello/:par1/:par2", (req, res) => {
  bodySchema.parse(req.body);
  querySchema.parse(req.query);
  paramsSchema.parse(req.params);
  headersSchema.parse(req.headers);
  res.json({ message: "Hello, World" });
});

// Express answers any thrown error with 500; a failed schema is the client's mistake.
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof z.ZodError) return res.status(400).json({ issues: err.issues });
  next(err);
});

app.listen(3000);
