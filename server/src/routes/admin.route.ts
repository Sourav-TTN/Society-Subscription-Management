import express from "express";
import { setAdmin } from "../lib/admin-auth.js";
import type { AdminSelectType } from "../db/schema.js";
import { getAdminMiddleware } from "../middlewares/admin.middleware.js";
import { societyAddHandler } from "../controllers/admin.controller.js";

const route = express.Router();

route
  .patch("/add-society", societyAddHandler)
  .get("/auth/failure", (req, res) => {
    return res.redirect(`${process.env.CLIENT_URL}/admin/login`);
  })
  .get("/auth/success", (req, res) => {
    if (req.user) {
      const token = setAdmin(req.user as AdminSelectType);
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
  .get("/get-admin", getAdminMiddleware, (req, res) => {
    console.log("Request got to /api/admin/get-admin");
    const admin = req.admin;

    return res
      .status(200)
      .json({ admin, message: "Admin found successfully", success: true });
  });

export default route;
