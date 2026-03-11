import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import type { Request, Response } from "express";
import { adminsTable, societiesTable } from "../db/schema.js";

const societyAddSchema = z.object({
  societyId: z.uuidv4("Invalid society ID"),
  adminId: z.uuidv4("Invalid admin ID"),
  pin: z.number("Invalid pin"),
});

async function societyAddHandler(req: Request, res: Response) {
  console.log("Request got to /api/admin/add-society");
  try {
    const body = req.body;

    const societyAddingVerificationResult = societyAddSchema.safeParse(body);

    if (societyAddingVerificationResult.error) {
      return res.status(400).json({
        error: societyAddingVerificationResult.error.message,
        success: false,
      });
    }

    const { societyId, pin, adminId } = societyAddingVerificationResult.data;

    const [society] = await db
      .select()
      .from(societiesTable)
      .where(eq(societiesTable.societyId, societyId));

    if (!society) {
      return res
        .status(404)
        .json({ error: "No society found.", success: false });
    }

    if (society.pin != pin) {
      return res.status(400).json({ error: "Invalid Pin.", success: false });
    }

    const [updatedAdmin] = await db
      .update(adminsTable)
      .set({ societyId })
      .where(eq(adminsTable.adminId, adminId))
      .returning();

    if (!updatedAdmin) {
      return res.status(404).json({ error: "No admin found.", success: false });
    }

    return res
      .status(200)
      .json({
        message: "Admin updated successfully",
        admin: updatedAdmin,
        society,
        success: true,
      });
  } catch (error) {
    console.error("ADMIN[ADD-SOCIETY][PATCH]:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong.", success: false });
  }
}

export { societyAddHandler };
