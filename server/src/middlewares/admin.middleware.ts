import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { adminsTable } from "../db/schema.js";
import { verifyAdmin } from "../lib/admin-auth.js";
import type { Request, Response, NextFunction } from "express";

const getAdminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // console.log("COOKIES:", req.cookies);
  const adminAuthCookieToken = req.cookies["admin-auth-token"];

  if (!adminAuthCookieToken) {
    return res.status(401).json({ error: "Unauthorized", success: false });
  }

  const verifyResults = verifyAdmin(adminAuthCookieToken);
  if (!verifyResults.success) {
    return res.status(401).json({
      error: "Session has been expired or Invalid token",
      success: false,
    });
  }

  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.adminId, verifyResults.adminId));

  if (!admin) {
    return res.status(401).json({ error: "Admin not found", success: false });
  }

  req.admin = admin;

  next();
};

export { getAdminMiddleware };
