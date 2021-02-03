import express from "express";
import cors from "cors";
import morgan from "morgan";
import path, { join } from "path";
import fs from "fs";

const port = process.env.port || 5000;

const app = express();
if (process.env.NODE_ENV !== "production") {
  console.log("Using cors");
  app.use(cors());
}

app.use(express.json(), express.urlencoded({ extended: false }));

app.use(morgan("dev"));

app.use(express.static("./build"));

app.get("/teams", async (req, res) => {
  fs.readFile("./teams.json", (err, data) => {
    if (err) {
      return res.sendStatus(500);
    }
    res.send(data);
  });
});

app.get("/*", (req, res) => {
  console.log("Should return site");
  res.set(
    "Content-Security-Policy",
    "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'"
  );
  res.sendFile(path.resolve("./build/index.html"));
});

app.listen(port, () => console.log(`App is running on port: ${port}`));
