import { db } from "../db/index.js";
import { sql } from "drizzle-orm";
import { verifyUser } from "../lib/user-auth.js";
import type { Request, Response, NextFunction } from "express";
import { usersTable, type UserSelectType } from "../db/schema.js";

const getUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const residentAuthToken = req.cookies["resident-auth-token"];

  if (!residentAuthToken) {
    return res.status(401).json({ error: "Unauthorized", success: false });
  }

  const verifyResults = verifyUser(residentAuthToken);
  if (!verifyResults.success) {
    return res.status(401).json({
      error: "Session has been expired or Invalid token",
      success: false,
    });
  }

  const userResult = await db.execute<UserSelectType>(sql`
      select 
        user_id as "userId",
        name as "name",
        email as "email",
        society_id as "societyId",
        created_at as "createdAt",
        updated_at as "updatedAt"
       from ${usersTable}
      where user_id = ${verifyResults.userId}
    `);

  const [user] = userResult.rows;

  if (!user) {
    return res.status(404).json({ error: "No user found", success: false });
  }

  req.user = user;

  next();
};

export { getUserMiddleware };
