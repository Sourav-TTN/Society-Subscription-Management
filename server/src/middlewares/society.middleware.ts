import { db } from "../db/index.js";
import { eq, sql } from "drizzle-orm";
import { validateUuid } from "../lib/utils.js";
import type { Request, Response, NextFunction } from "express";
import { societiesTable, type SocietySelectType } from "../db/schema.js";

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

  const societyResult = await db.execute<SocietySelectType>(sql`
      select 
        society_id as "societyId",
        name as "name",
        address as "address",
        pin as "pin",
        created_at as "createdAt",
        updated_at as "updatedAt"
       from ${societiesTable}
      where society_id = ${societyId}
    `);

  const [society] = societyResult.rows;

  console.log(society);

  // const [society] = await db
  //   .select()
  //   .from(societiesTable)
  //   .where(eq(societiesTable.societyId, societyId));

  if (!society) {
    return res.status(404).json({ error: "No society found", success: false });
  }

  req.society = society;

  next();
};

export { getSocietyMiddleware };
