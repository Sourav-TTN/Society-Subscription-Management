import express from "express";
import passport from "passport";

const router = express.Router({ mergeParams: true });

router
  .get(
    "/google/callback",
    passport.authenticate("google", {
      successRedirect: "/api/admin/auth/success",
      failureRedirect: "/api/admin/auth/failure",
    }),
  )
  .get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] }),
  );

export default router;
