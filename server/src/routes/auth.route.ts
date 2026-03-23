import express from "express";
import passport from "passport";
import { setAdmin } from "../lib/admin-auth.js";

const router = express.Router({ mergeParams: true });

router
  .get("/google/callback", (req, res, next) => {
    passport.authenticate("google", async (err: any, user: any) => {
      if (err || !user) {
        return res.redirect(`${process.env.CLIENT_URL}/admin/login`);
      }

      const token = setAdmin(user);

      res.cookie("admin-auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 2 * 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(`${process.env.CLIENT_URL}/admin/dashboard`);
    })(req, res, next);
  })
  .get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] }),
  );

export default router;
