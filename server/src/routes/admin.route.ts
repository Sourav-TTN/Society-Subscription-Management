import express from "express";
import passport from "passport";
import { setAdmin } from "../lib/admin-auth.js";
import type { AdminsSelectType } from "../db/schema.js";
import { getAdminMiddleware } from "../middlewares/admin.middleware.js";

const route = express.Router();

route
  .get("/auth/failure", (req, res) => {
    return res.redirect(`${process.env.CLIENT_URL}/admin/login`);
  })
  .get("/auth/success", (req, res) => {
    if (req.user) {
      const token = setAdmin(req.user as AdminsSelectType);
      res.cookie("admin-auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 2 * 7 * 24 * 60 * 60 * 1000,
      });
      return res.redirect(`${process.env.CLIENT_URL}/admin/dashboard`);
    }
    return res.redirect(`${process.env.CLIENT_URL}/admin/login`);
  })
  .get("/getAdmin", getAdminMiddleware, (req, res) => {
    const admin = req.admin;

    return res
      .status(200)
      .json({ admin, message: "Admin found successfully", success: true });
  });

export default route;
