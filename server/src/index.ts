import "dotenv/config";
import cors from "cors";
import express from "express";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import { configurePassport } from "./services/passport.js";

import authRoute from "./routes/auth.route.js";
import flatRoute from "./routes/flat.route.js";
import billsRoute from "./routes/bill.route.js";
import usersRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js";
import reportRoute from "./routes/report.route.js";
import paymentRoute from "./routes/payment.route.js";
import societyRoute from "./routes/society.route.js";
import flatTypesRoute from "./routes/flat-types.route.js";
import notificationRoute from "./routes/notification.route.js";
import subscriptionRoute from "./routes/subscription.route.js";
import flatRecipientRoute from "./routes/flat-recipient.route.js";

configurePassport();

const PORT = process.env.PORT ?? 8000;

const app = express();

app.use(cookieParser());

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
app.use("/api/society", societyRoute);
app.use("/api/society/:societyId/flats", flatRoute);
app.use("/api/society/:societyId/users", usersRoute);
app.use("/api/society/:societyId/bills", billsRoute);
app.use("/api/society/:societyId/reports", reportRoute);
app.use("/api/society/:societyId/payments", paymentRoute);
app.use("/api/society/:societyId/flat-types", flatTypesRoute);
app.use("/api/society/:societyId/subscriptions", subscriptionRoute);
app.use("/api/society/:societyId/notifications", notificationRoute);
app.use("/api/society/:societyId/flat-recipients", flatRecipientRoute);

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
