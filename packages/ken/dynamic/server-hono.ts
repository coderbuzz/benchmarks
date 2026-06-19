import { Hono } from "hono";

const app = new Hono();
app.get("/hello", (c) => c.json({ message: "Hello, World" }));

Bun.serve({ fetch: app.fetch, port: 3000 });
