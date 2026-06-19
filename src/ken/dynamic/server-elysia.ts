import { Elysia } from "elysia";

new Elysia()
  .get("/hello", () => ({ message: "Hello, World" }))
  .listen(3000);
