import { AppServer } from "@coderbuzz/ken";

const app = new AppServer({ port: 3000 });
app.get("/hello", { message: "Hello, World" });
app.run();
