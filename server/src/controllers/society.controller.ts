import {
  societiesTable,
  societiesInsertSchema,
  type SocietyInsertType,
} from "../db/schema.js";
import { db } from "../db/index.js";
import type { Request, Response } from "express";

async function societyCreationHandler(req: Request, res: Response) {
  console.log("Request got to /api/society/create");
  try {
    const body = req.body as SocietyInsertType;

    const societyValidationResult = societiesInsertSchema.safeParse(body);

    if (societyValidationResult.error) {
      return res
        .status(400)
        .json({ error: societyValidationResult.error.message, success: false });
    }

    const data = societyValidationResult.data;

    const [society] = await db
      .insert(societiesTable)
      .values({
        ...data,
      })
      .returning();

    if (!society) {
      return res
        .status(500)
        .json({ error: "Unable to create society right now.", success: false });
    }

    return res.status(201).json({
      society,
      message: "Society created successfully",
      success: true,
    });
  } catch (error) {
    console.error("SOCIETY[CREATE][POST]:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong", success: false });
  }
}

async function getAllSocietiesHandler(req: Request, res: Response) {
  console.log("Request got to /api/society/all");
  try {
    const societies = await db.select().from(societiesTable);

    if (!societies || societies.length <= 0) {
      return res
        .status(404)
        .json({ error: "No societies found.", success: false });
    }

    return res.status(200).json({
      message: "All societies found successfully",
      societies,
      success: true,
    });
  } catch (error) {
    console.error("SOCIETIES[ALL][GET]:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong.", success: false });
  }
}

export { societyCreationHandler, getAllSocietiesHandler };
