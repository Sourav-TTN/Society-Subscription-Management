import { eq, ne } from "drizzle-orm";
import { db } from "../db/index.js";
import { adminsTable } from "../db/schema.js";
import { verifyAdmin } from "../lib/admin-auth.js";
import type { Request, Response, NextFunction } from "express";
import { validateUuid } from "../lib/utils.js";

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

const validateAdminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { adminId } = req.params;

  if (!adminId) {
    return res
      .status(400)
      .json({ error: "No Admin ID provided.", success: false });
  }

  const validationResult = validateUuid.safeParse({ id: adminId });

  if (validationResult.error) {
    return res
      .status(400)
      .json({ error: validationResult.error.message, success: false });
  }

  adminId = validationResult.data.id;

  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.adminId, adminId));

  if (!admin) {
    return res.status(401).json({ error: "No admin found.", success: false });
  }

  req.admin = admin;

  next();
};

export { getAdminMiddleware, validateAdminMiddleware };
