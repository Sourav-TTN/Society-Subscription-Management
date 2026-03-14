import type { Request, Response } from "express";
import { validateUuid } from "../lib/utils.js";
import { db } from "../db/index.js";
import { flatTypesTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

async function getAllFlatTypesHanlder(req: Request, res: Response) {
  try {
    let { societyId } = req.params;
    console.log(`Request recieved at /api/society/${societyId}/flat-types`);

    const validationResult = validateUuid.safeParse({ id: societyId });

    if (validationResult.error) {
      return res.status(400).json({ error: validationResult.error.message });
    }

    societyId = validationResult.data.id;

    const flatTypes = await db
      .select()
      .from(flatTypesTable)
      .where(eq(flatTypesTable.societyId, societyId));

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
