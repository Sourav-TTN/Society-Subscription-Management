import express from "express";
import { setAdmin } from "../lib/admin-auth.js";
import { societiesTable, type AdminSelectType } from "../db/schema.js";
import { getAdminMiddleware } from "../middlewares/admin.middleware.js";
import { societyAddHandler } from "../controllers/admin.controller.js";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";

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
  .get("/get-admin", getAdminMiddleware, async (req, res) => {
    console.log("Request got to /api/admin/get-admin");
    const admin = req.admin;

    let society = undefined;
    if (admin?.societyId) {
      let results = await db
        .select()
        .from(societiesTable)
        .where(eq(societiesTable.societyId, admin.societyId));

      society = results[0];
    }

    return res
      .status(200)
      .json({
        admin,
        message: "Admin found successfully",
        society,
        success: true,
      });
  });

export default route;
