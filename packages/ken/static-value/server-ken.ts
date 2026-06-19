import { AppServer } from "@coderbuzz/ken";

new AppServer({ port: 3000 })
  .get("/hello", { message: "Hello, World" })
  .run();
