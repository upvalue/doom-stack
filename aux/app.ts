import consoleStamp from "console-stamp";
import express from "express";
import logger from "morgan";
import * as path from "path";

// Create Express server
export const app = express();

app.use(logger("dev"));

app.use(express.static(path.join(__dirname, "../public")));
app.get("/", (_req, res) => {
  res.status(200).send("channel open");
});

app.listen({
  port: process.env.PORT || 3001,
  host: process.env.HOST || "0.0.0.0",
});

console.log(`Listening on port`, process.env.PORT || 3001);

consoleStamp(console);
