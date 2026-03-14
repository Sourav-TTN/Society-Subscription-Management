import type { Request, Response, NextFunction } from "express";
import { validateUuid } from "../lib/utils.js";
import { db } from "../db/index.js";
import { societiesTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

const getSocietyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { societyId } = req.params;

  const validationResult = validateUuid.safeParse({ id: societyId });

  if (validationResult.error) {
    return res
      .status(400)
      .json({ error: validationResult.error.message, success: false });
  }

  societyId = validationResult.data.id;

  const [society] = await db
    .select()
    .from(societiesTable)
    .where(eq(societiesTable.societyId, societyId));

  if (!society) {
    return res.status(404).json({ error: "No society found", success: false });
  }

  req.society = society;

  next();
};

export { getSocietyMiddleware };
