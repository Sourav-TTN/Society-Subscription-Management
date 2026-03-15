import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { validateUuid } from "../lib/utils.js";
import {
  flatTypesTable,
  societiesTable,
  subscriptionsTable,
  type FlatTypeSelectType,
  type SubscriptionSelectType,
} from "../db/schema.js";
import type { Request, Response } from "express";

async function getAllFlatTypesHanlder(req: Request, res: Response) {
  try {
    let { societyId } = req.params;
    console.log(`Request recieved at /api/society/${societyId}/flat-types`);

    const validationResult = validateUuid.safeParse({ id: societyId });

    if (validationResult.error) {
      return res.status(400).json({ error: validationResult.error.message });
    }

    societyId = validationResult.data.id;

    const currentDate = new Date();

    const flatTypesResult = await db.execute(sql`
      select 
      f.flat_type_id as "flatTypeId",
      f.society_id as "societyId",
      f.size as "size",
      f.created_at as "createdAt",
      f.updated_at as "updatedAt"
      from ${flatTypesTable} f
      join ${subscriptionsTable} s on s.flat_type_id = f.flat_type_id
      where f.society_id = ${societyId} and s.effective_from <= ${currentDate}
    `);

    const flatTypes = flatTypesResult.rows;

    return res.status(200).json({
      flatTypes,
      message: "All flat types found successfully",
      success: true,
    });
  } catch (error) {
    console.error("FLAT-TYPES[ALL][GET]:", error);
    return res.status(500).json({
      error: "Something went wrong",
      success: false,
    });
  }
}

export { getAllFlatTypesHanlder };
