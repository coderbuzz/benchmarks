import express from "express";

const app = express();
app.get("/hello", (req, res) => res.json({ message: "Hello, World" }));
app.listen(3000);
