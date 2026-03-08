import "dotenv/config";
import cors from "cors";
import express from "express";
import passport from "passport";
import session from "express-session";
import { configurePassport } from "./services/passport.js";

import authRoute from "./routes/auth.route.js";
import adminRoute from "./routes/admin.route.js";

configurePassport();

const PORT = process.env.PORT ?? 8000;

const app = express();

app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
    preflightContinue: true,
  }),
);

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  return res
    .status(200)
    .json({ message: "API is working fine", success: true });
});

app.use("/auth", authRoute);
app.use("/api/admin", adminRoute);

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
