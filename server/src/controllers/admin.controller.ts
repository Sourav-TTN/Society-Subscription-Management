import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import type { Request, Response } from "express";
import {
  adminsInsertSchema,
  adminsTable,
  societiesTable,
} from "../db/schema.js";
import { validateUuid } from "../lib/utils.js";

const societyAddSchema = z.object({
  societyId: z.uuidv4("Invalid society ID"),
  adminId: z.uuidv4("Invalid admin ID"),
  pin: z.number("Invalid pin"),
});

async function societyAddHandler(req: Request, res: Response) {
  console.log("Request recieved at /api/admin/add-society");
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

    return res.status(200).json({
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

async function profileUpdateHandler(req: Request, res: Response) {
  try {
    let { adminId } = req.params;
    const body = req.body;
    console.log("Request recieved at /api/admin/profile-update/" + adminId);

    const profileUpdateVerificationResult = z
      .object({
        name: z.string("Name must be between 2 and 100 characters"),
      })
      .safeParse(body);

    if (profileUpdateVerificationResult.error) {
      return res.status(400).json({
        error: profileUpdateVerificationResult.error.message,
        success: false,
      });
    }

    const validationResult = validateUuid.safeParse({ id: adminId });

    if (validationResult.error) {
      return res.status(400).json({
        error: "Invalid admin ID.",
        success: false,
      });
    }

    const { name } = profileUpdateVerificationResult.data;
    adminId = validationResult.data.id;

    const existingAdminResult = await db.execute(sql`
      select 
        a.admin_id as "adminId",
        a.name as "name",
        a.email as "email",
        a.society_id as "societyId",
        a.created_at as "createdAt",
        a.updated_at as "updatedAt"
      from ${adminsTable} as a
      where a.admin_id = ${adminId}
    `);

    const existingAdmin = existingAdminResult.rows[0];

    if (!existingAdmin) {
      return res.status(404).json({ error: "No admin found.", success: false });
    }

    const updatdAdminResult = await db.execute(sql`
      update ${adminsTable} as a
      set
        name = coalesce(${name}, a.name)
      where a.admin_id = ${adminId}
      returning *;
    `);

    const updatedAdmin = updatdAdminResult.rows[0];

    return res.status(200).json({
      message: "Profile updated successfully",
      admin: updatedAdmin,
      success: true,
    });
  } catch (error) {
    console.error("ADMIN[UPDATE-PROFILE][PATCH]:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong.", success: false });
  }
}

export { societyAddHandler, profileUpdateHandler };
