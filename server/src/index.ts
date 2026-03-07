import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const PORT = process.env.PORT ?? 8000;

const app = express();

app.use(
  cors({
    origin: ["*"],
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
    preflightContinue: true,
  }),
);

app.get("/", (req, res) => {
  return res
    .status(200)
    .json({ message: "API is working fine", success: true });
});

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
