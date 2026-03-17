import {
  flatsTable,
  usersTable,
  billsTable,
  flatTypesTable,
  flatsInsertSchema,
  subscriptionsTable,
  flatRecipientsTable,
  type SubscriptionSelectType,
} from "../db/schema.js";

import { z } from "zod";
import { db } from "../db/index.js";
import { and, eq, ne, sql } from "drizzle-orm";
import { validateUuid } from "../lib/utils.js";
import type { Request, Response } from "express";
import axios from "axios";

async function getFlatHanlder(req: Request, res: Response) {
  try {
    let { flatId, societyId } = req.params;
    console.log(
      `Request recieved at /api/society/${societyId}/flats/${flatId}`,
    );

    const validationResult = validateUuid.safeParse({ id: flatId });

    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.message, success: false });
    }

    flatId = validationResult.data.id;

    const [flat] = await db
      .select({
        flatId: flatsTable.flatId,
        flatBlock: flatsTable.flatBlock,
        flatFloor: flatsTable.flatFloor,
        flatNumber: flatsTable.flatNumber,
        societyId: flatsTable.societyId,
        size: flatTypesTable.size,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
        createdAt: flatsTable.createdAt,
        updatedAt: flatsTable.updatedAt,
      })
      .from(flatsTable)
      .where(eq(flatsTable.flatId, flatId))
      .leftJoin(flatRecipientsTable, eq(flatRecipientsTable.flatId, flatId))
      .leftJoin(usersTable, eq(usersTable.userId, flatRecipientsTable.ownerId))
      .innerJoin(
        flatTypesTable,
        eq(flatTypesTable.flatTypeId, flatsTable.flatTypeId),
      );

    if (!flat) {
      return res.status(404).json({ error: "No flat found", success: false });
    }

    return res
      .status(200)
      .json({ flat, message: "Flat found successfully", success: true });
  } catch (error) {
    console.error("FLAT[:ID][GET]", error);
    return res
      .status(500)
      .json({ error: "Something went wrong", success: false });
  }
}

async function createFlatHandler(req: Request, res: Response) {
  try {
    const body = req.body;
    const { societyId } = req.params;

    console.log(`Request recieved at /api/society/${societyId}/flats`);

    const validationResult = flatsInsertSchema.safeParse({
      ...body,
      societyId,
    });

    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.message, success: false });
    }

    const data = validationResult.data;
    let flatTypeId = data.flatTypeId;
    let currentDate = new Date();

    let { rows: subscriptions } = await db.execute<SubscriptionSelectType>(sql`
      select * from ${subscriptionsTable}
      where flat_type_id = ${flatTypeId} and effective_from <= ${currentDate}
    `);

    if (subscriptions.length == 0) {
      return res.status(400).json({
        error: "Create subscription for the current month first.",
        success: false,
      });
    }

    // const newFlatResult = await db.execute<FlatSelectType>(sql`
    //   insert into ${flatsTable} ()
    //   values (${sql.join(
    //     Object.keys(data),
    //     sql`, `,
    //   )})
    //   returning *;
    //   `);

    // const [newFlat] = newFlatResult.rows;

    const [newFlat] = await db
      .insert(flatsTable)
      .values({
        ...data,
      })
      .returning();

    if (!newFlat) {
      return res
        .status(500)
        .json({ error: "Unable to create flat now", success: false });
    }

    const [flat] = await db
      .select({
        flatId: flatsTable.flatId,
        flatBlock: flatsTable.flatBlock,
        flatFloor: flatsTable.flatFloor,
        flatNumber: flatsTable.flatNumber,
        societyId: flatsTable.societyId,
        size: flatTypesTable.size,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
        createdAt: flatsTable.createdAt,
        updatedAt: flatsTable.updatedAt,
      })
      .from(flatsTable)
      .where(eq(flatsTable.flatId, newFlat.flatId))
      .leftJoin(
        flatRecipientsTable,
        eq(flatRecipientsTable.flatId, newFlat.flatId),
      )
      .leftJoin(usersTable, eq(usersTable.userId, flatRecipientsTable.ownerId))
      .innerJoin(
        flatTypesTable,
        eq(flatTypesTable.flatTypeId, flatsTable.flatTypeId),
      );

    return res.status(201).json({
      message: "Flat created successfully",
      flat,
      success: true,
    });
  } catch (error: any) {
    console.error("FLAT[CREATE][POST]:", error);

    const constraint = error?.cause?.constraint;

    if (constraint == "unique_flat_address") {
      return res.status(409).json({
        error: "Flat already exists with same block, floor and number",
        success: false,
      });
    }

    return res
      .status(500)
      .json({ error: "Something went wrong", success: false });
  }
}

async function assignOwnerHandler(req: Request, res: Response) {
  try {
    let body = req.body;
    let { flatId, societyId } = req.params;

    console.log(
      `Request received at /api/society/${societyId}/flats/${flatId}/assign-owner`,
    );

    const validationResult = z
      .object({
        ownerId: z.uuidv4("Invalid owner id format"),
        from: z.coerce.date("Invalid date").optional(),
      })
      .safeParse(body);

    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.message, success: false });
    }

    const flatValidation = validateUuid.safeParse({ id: flatId });

    if (flatValidation.error) {
      return res
        .status(400)
        .json({ error: flatValidation.error.message, success: false });
    }

    flatId = flatValidation.data.id;

    const { ownerId, from } = validationResult.data;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.userId, ownerId));

    if (!user) {
      return res
        .status(404)
        .json({ error: "No user found with such id", success: false });
    }

    const [flat] = await db
      .select()
      .from(flatsTable)
      .where(eq(flatsTable.flatId, flatId));

    if (!flat) {
      return res.status(404).json({
        error: "No flat found with the provided flat id",
        success: false,
      });
    }

    const [newRecipient] = await db
      .insert(flatRecipientsTable)
      .values({
        flatId,
        ownerId,
        from,
        isCurrentOwner: true,
      })
      .returning();

    if (!newRecipient) {
      throw new Error("Unable to update owner for now.");
    }

    await db
      .update(flatRecipientsTable)
      .set({
        isCurrentOwner: false,
        to: newRecipient.createdAt,
      })
      .where(
        and(
          ne(flatRecipientsTable.ownerId, newRecipient.ownerId),
          eq(flatRecipientsTable.flatId, flatId),
        ),
      );

    // TODO: Create bill for the new owner
    const response = await axios.post(
      `${process.env.SERVER_URL}/api/society/${societyId}/bills/generate/${newRecipient.flatRecipientId}`,
    );

    return res
      .status(201)
      .json({ message: "Owner added successfully", success: true });
  } catch (error) {
    console.error("FLATS[ADD-OWNER][PATCH]:", error);
    return res.status(500).json({
      error: "Something went wrong",
      success: false,
    });
  }
}

async function removeOwnerHandler(req: Request, res: Response) {
  try {
    let { flatId, societyId } = req.params;

    console.log(
      `Request received at /api/society/${societyId}/flats/${flatId}/remove-owner`,
    );

    const flatValidation = validateUuid.safeParse({ id: flatId });
    if (flatValidation.error) {
      return res
        .status(400)
        .json({ error: flatValidation.error.message, success: false });
    }

    flatId = flatValidation.data.id;

    const [flat] = await db
      .select()
      .from(flatsTable)
      .where(eq(flatsTable.flatId, flatId));

    if (!flat) {
      return res.status(404).json({
        error: "No flat found with the provided flat id",
        success: false,
      });
    }

    const [currentOwner] = await db
      .select()
      .from(flatRecipientsTable)
      .where(
        and(
          eq(flatRecipientsTable.flatId, flatId),
          eq(flatRecipientsTable.isCurrentOwner, true),
        ),
      );

    if (!currentOwner) {
      return res.status(404).json({
        error: "No current owner found for this flat",
        success: false,
      });
    }

    const [updatedRecipient] = await db
      .update(flatRecipientsTable)
      .set({
        isCurrentOwner: false,
        to: new Date(),
      })
      .where(
        and(
          eq(flatRecipientsTable.flatId, flatId),
          eq(flatRecipientsTable.isCurrentOwner, true),
        ),
      )
      .returning();

    if (!updatedRecipient) {
      throw new Error("Unable to remove owner for now.");
    }

    // TODO: Handle any pending bills or other related data

    return res.status(200).json({
      message: "Owner removed successfully",
      success: true,
    });
  } catch (error) {
    console.error("FLATS[REMOVE-OWNER][PATCH]:", error);
    return res.status(500).json({
      error: "Something went wrong",
      success: false,
    });
  }
}

async function getAllFlatsHandler(req: Request, res: Response) {
  try {
    let { societyId } = req.params;
    console.log(`Request recieved at /api/society/${societyId}/flats`);
    const validationResult = validateUuid.safeParse({ id: societyId });

    const paginationSchema = z
      .object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10),
      })
      .safeParse(req.query);

    if (validationResult.error || paginationSchema.error) {
      return res.status(400).json({
        error:
          validationResult.error?.message || paginationSchema.error?.message,
        success: false,
      });
    }

    societyId = validationResult.data.id;
    let { page = 1, limit = 10 } = paginationSchema.data;

    const flats = await db
      .select({
        flatId: flatsTable.flatId,
        flatBlock: flatsTable.flatBlock,
        flatFloor: flatsTable.flatFloor,
        flatNumber: flatsTable.flatNumber,
        size: flatTypesTable.size,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
        createdAt: flatsTable.createdAt,
        updatedAt: flatsTable.updatedAt,
      })
      .from(flatsTable)
      .where(
        and(
          eq(flatsTable.societyId, societyId),
          eq(flatsTable.isDeleted, false),
        ),
      )
      .leftJoin(
        flatRecipientsTable,
        and(
          eq(flatRecipientsTable.flatId, flatsTable.flatId),
          eq(flatRecipientsTable.isCurrentOwner, true),
        ),
      )
      .leftJoin(usersTable, eq(usersTable.userId, flatRecipientsTable.ownerId))
      .innerJoin(
        flatTypesTable,
        eq(flatTypesTable.flatTypeId, flatsTable.flatTypeId),
      )
      .offset((page - 1) * limit)
      .limit(limit);

    // console.log(flats);

    return res
      .status(200)
      .json({ flats, message: "All flats found successfully" });
  } catch (error) {
    console.error("FLATS[ALL][GET]:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong", success: false });
  }
}

async function updateFlatHanlder(req: Request, res: Response) {
  try {
    let { flatId, societyId } = req.params;
    console.log(
      `Request recieved at /api/society/${societyId}/flats/${flatId}`,
    );
    let body = req.body;
    const validationResult = validateUuid.safeParse({ id: flatId });
    const updateValidationSchemaResult = flatsInsertSchema
      .partial()
      .safeParse(body);

    if (validationResult.error || updateValidationSchemaResult.error) {
      return res.status(400).json({
        error:
          validationResult.error?.message ||
          updateValidationSchemaResult.error?.message,
        success: false,
      });
    }

    flatId = validationResult.data.id;
    let data = updateValidationSchemaResult.data;

    const [existingFlat] = await db
      .select()
      .from(flatsTable)
      .where(eq(flatsTable.flatId, flatId));

    if (!existingFlat) {
      return res.status(404).json({
        error: "No flat found",
        success: false,
      });
    }

    const [updatedFlat] = await db
      .update(flatsTable)
      .set({
        ...data,
      })
      .returning();

    if (!updatedFlat) {
      return res.status(404).json({ error: "No flat found", success: false });
    }

    const [flat] = await db
      .select({
        flatId: flatsTable.flatId,
        flatBlock: flatsTable.flatBlock,
        flatFloor: flatsTable.flatFloor,
        flatNumber: flatsTable.flatNumber,
        societyId: flatsTable.societyId,
        size: flatTypesTable.size,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
        createdAt: flatsTable.createdAt,
        updatedAt: flatsTable.updatedAt,
      })
      .from(flatsTable)
      .where(eq(flatsTable.flatId, flatId))
      .leftJoin(flatRecipientsTable, eq(flatRecipientsTable.flatId, flatId))
      .leftJoin(usersTable, eq(usersTable.userId, flatRecipientsTable.ownerId))
      .innerJoin(
        flatTypesTable,
        eq(flatTypesTable.flatTypeId, flatsTable.flatTypeId),
      );

    return res.status(200).json({
      message: "Flat has been updated successfully",
      flat,
      success: true,
    });
  } catch (error) {
    console.error("FLAT[:ID][PATCH]", error);
    return res
      .status(500)
      .json({ error: "Something went wrong", success: false });
  }
}

async function deleteFlatHanlder(req: Request, res: Response) {
  try {
    let { flatId, societyId } = req.params;
    console.log(
      `Request recieved at /api/society/${societyId}/flats/${flatId}`,
    );
    const validationResult = validateUuid.safeParse({ id: flatId });

    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.message, success: false });
    }

    flatId = validationResult.data.id;

    const [flat] = await db
      .select({
        flatId: flatsTable.flatId,
        flatBlock: flatsTable.flatBlock,
        flatFloor: flatsTable.flatFloor,
        flatNumber: flatsTable.flatNumber,
        societyId: flatsTable.societyId,
        size: flatTypesTable.size,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
        isCurrentOwner: flatRecipientsTable.isCurrentOwner,
        createdAt: flatsTable.createdAt,
        updatedAt: flatsTable.updatedAt,
      })
      .from(flatsTable)
      .where(eq(flatsTable.flatId, flatId))
      .leftJoin(flatRecipientsTable, eq(flatRecipientsTable.flatId, flatId))
      .leftJoin(usersTable, eq(usersTable.userId, flatRecipientsTable.ownerId))
      .innerJoin(
        flatTypesTable,
        eq(flatTypesTable.flatTypeId, flatsTable.flatTypeId),
      );

    if (!flat) {
      return res.status(404).json({ error: "No flat found", success: false });
    }

    if (flat.isCurrentOwner) {
      return res.status(400).json({
        success: false,
        error: "This flat has a living resident.",
      });
    }

    await db
      .update(flatsTable)
      .set({ isDeleted: true })
      .where(eq(flatsTable.flatId, flatId));

    return res
      .status(200)
      .json({ message: "Flat has been deleted successfully", success: true });
  } catch (error) {
    console.error("FLAT[:ID][DELETE]", error);
    return res
      .status(500)
      .json({ error: "Something went wrong", success: false });
  }
}

export {
  getFlatHanlder,
  createFlatHandler,
  updateFlatHanlder,
  deleteFlatHanlder,
  getAllFlatsHandler,
  assignOwnerHandler,
  removeOwnerHandler,
};
