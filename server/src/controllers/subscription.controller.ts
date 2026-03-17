import {
  flatsTable,
  flatTypesTable,
  subscriptionsTable,
  flatRecipientsTable,
  subscriptionsInsertSchema,
  type FlatRecipientSelectType,
} from "../db/schema.js";

import { z } from "zod";
import { db } from "../db/index.js";
import { validateUuid } from "../lib/utils.js";
import type { Request, Response } from "express";
import { eq, desc, and, sql, gte, lt } from "drizzle-orm";

async function getSubscriptionHandler(req: Request, res: Response) {
  try {
    let { subscriptionId, societyId } = req.params;
    console.log(
      `Request recieved at /api/society/${societyId}/subscriptions/${subscriptionId}`,
    );

    const validationResult = validateUuid.safeParse({ id: subscriptionId });

    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.message, success: false });
    }

    subscriptionId = validationResult.data.id;

    const [subscription] = await db
      .select({
        subscriptionId: subscriptionsTable.subscriptionId,
        flatTypeId: subscriptionsTable.flatTypeId,
        size: flatTypesTable.size,
        charges: subscriptionsTable.charges,
        effectiveFrom: subscriptionsTable.effectiveFrom,
        createdAt: subscriptionsTable.createdAt,
        updatedAt: subscriptionsTable.updatedAt,
      })
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.subscriptionId, subscriptionId))
      .innerJoin(
        flatTypesTable,
        eq(flatTypesTable.flatTypeId, subscriptionsTable.flatTypeId),
      );

    if (!subscription) {
      return res
        .status(404)
        .json({ error: "No subscription found", success: false });
    }

    return res.status(200).json({
      subscription,
      message: "Subscription found successfully",
      success: true,
    });
  } catch (error) {
    console.error("SUBSCRIPTION[:ID][GET]", error);
    return res
      .status(500)
      .json({ error: "Something went wrong", success: false });
  }
}

async function createSubscriptionHandler(req: Request, res: Response) {
  try {
    let { size, flatTypeId, ...body } = req.body;
    const { societyId } = req.params as { societyId: string };

    console.log(`Request recieved at /api/society/${societyId}/subscriptions`);

    if (size) {
      const [newFlatType] = await db
        .insert(flatTypesTable)
        .values({
          size,
          societyId,
        })
        .onConflictDoNothing({})
        .returning();

      if (newFlatType) {
        flatTypeId = newFlatType.flatTypeId;
      } else {
        const [existingFlatType] = await db
          .select()
          .from(flatTypesTable)
          .where(
            and(
              eq(flatTypesTable.size, size),
              eq(flatTypesTable.societyId, societyId),
            ),
          );

        flatTypeId = existingFlatType?.flatTypeId;
      }
    }

    // console.log(flatTypeId);

    const validationResult = subscriptionsInsertSchema.safeParse({
      ...body,
      flatTypeId,
      effectiveFrom: new Date(body.effectiveFrom),
    });

    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.message, success: false });
    }

    const data = validationResult.data;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const subscriptionDate = data.effectiveFrom;
    const subscriptionMonth = new Date(subscriptionDate).getMonth();
    const subscriptionYear = new Date(subscriptionDate).getFullYear();

    if (
      subscriptionYear < currentYear ||
      (subscriptionYear === currentYear && subscriptionMonth < currentMonth)
    ) {
      return res.status(400).json({
        error: "You can't create the earlier's month subscription.",
        success: false,
      });
    }

    const startOfMonth = new Date(subscriptionYear, subscriptionMonth, 1);
    const endOfMonth = new Date(subscriptionYear, subscriptionMonth + 1, 1);

    const [existingSubscription] = await db
      .select()
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.flatTypeId, flatTypeId),
          gte(subscriptionsTable.effectiveFrom, startOfMonth),
          lt(subscriptionsTable.effectiveFrom, endOfMonth),
        ),
      );

    if (existingSubscription) {
      return res.status(400).json({
        error: "Subscription for current's month is already existed",
        success: false,
      });
    }

    const [created] = await db
      .insert(subscriptionsTable)
      .values({ ...data })
      .returning();

    if (!created) {
      return res.status(400).json({
        error: "Can't create subscription right now.",
        success: false,
      });
    }

    const [subscription] = await db
      .select({
        subscriptionId: subscriptionsTable.subscriptionId,
        flatTypeId: subscriptionsTable.flatTypeId,
        size: flatTypesTable.size,
        charges: subscriptionsTable.charges,
        effectiveFrom: subscriptionsTable.effectiveFrom,
        createdAt: subscriptionsTable.createdAt,
        updatedAt: subscriptionsTable.updatedAt,
      })
      .from(subscriptionsTable)
      .innerJoin(
        flatTypesTable,
        eq(flatTypesTable.flatTypeId, subscriptionsTable.flatTypeId),
      )
      .where(eq(subscriptionsTable.subscriptionId, created.subscriptionId));

    return res.status(201).json({
      message: "Subscription created successfully",
      subscription,
      success: true,
    });
  } catch (error) {
    console.error("SUBSCRIPTIONS[CREATE][POST]:", error);
    return res.status(500).json({
      error: "Something went wrong",
      success: false,
    });
  }
}

async function getAllSubscriptionsHandler(req: Request, res: Response) {
  try {
    let { societyId } = req.params;
    console.log(`Request recieved at /api/society/${societyId}/subscriptions`);

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

    const subscriptions = await db
      .select({
        subscriptionId: subscriptionsTable.subscriptionId,
        flatTypeId: subscriptionsTable.flatTypeId,
        size: flatTypesTable.size,
        charges: subscriptionsTable.charges,
        effectiveFrom: subscriptionsTable.effectiveFrom,
        createdAt: subscriptionsTable.createdAt,
        updatedAt: subscriptionsTable.updatedAt,
      })
      .from(subscriptionsTable)
      .where(eq(flatTypesTable.societyId, societyId))
      .innerJoin(
        flatTypesTable,
        eq(flatTypesTable.flatTypeId, subscriptionsTable.flatTypeId),
      )
      .orderBy(desc(subscriptionsTable.effectiveFrom))
      .offset((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      message: "All subscriptions found successfully",
      subscriptions,
      success: true,
    });
  } catch (error) {
    console.error("SUBSCRIPTIONS[ALL][GET]:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong", success: false });
  }
}

async function updateSubscriptionHandler(req: Request, res: Response) {
  try {
    let { subscriptionId, societyId } = req.params;
    console.log(
      `Request recieved at /api/society/${societyId}/subscriptions/${subscriptionId}`,
    );
    let body = req.body;

    const validationResult = validateUuid.safeParse({ id: subscriptionId });
    const updateValidationSchemaResult = subscriptionsInsertSchema
      .omit({
        createdBy: true,
        flatTypeId: true,
      })
      .partial({ charges: true })
      .safeParse({
        ...body,
        effectiveFrom: new Date(body.effectiveFrom),
      });

    if (validationResult.error || updateValidationSchemaResult.error) {
      return res.status(400).json({
        error:
          validationResult.error?.message ||
          updateValidationSchemaResult.error?.message,
        success: false,
      });
    }

    subscriptionId = validationResult.data.id;
    let data = updateValidationSchemaResult.data;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const subscriptionDate = data.effectiveFrom;
    const subscriptionMonth = new Date(subscriptionDate).getMonth();
    const subscriptionYear = new Date(subscriptionDate).getFullYear();

    if (
      subscriptionYear < currentYear ||
      (subscriptionYear === currentYear && subscriptionMonth < currentMonth)
    ) {
      return res.status(400).json({
        error: "You can't update earlier's month subscription.",
        success: false,
      });
    }

    const flatRecipientsResult = await db.execute<FlatRecipientSelectType>(sql`
      select * from ${flatRecipientsTable} fr
      join ${flatsTable} f on  f.flat_id = fr.flat_id
      join ${flatTypesTable} ft on ft.flat_type_id = f.flat_type_id
      join ${subscriptionsTable} s on s.flat_type_id = ft.flat_type_id
      where s.subscription_id = ${subscriptionId} and fr.is_current_owner = ${true}
    `);

    const flatRecipients = flatRecipientsResult.rows;

    if (
      subscriptionYear === currentYear &&
      subscriptionMonth == currentMonth &&
      flatRecipients.length > 0
    ) {
      return res.status(400).json({
        error:
          "You can't update the current's month subscription with living residents.",
        success: false,
      });
    }

    const [updatedSubscription] = await db
      .update(subscriptionsTable)
      .set({
        ...data,
      })
      .where(eq(subscriptionsTable.subscriptionId, subscriptionId))
      .returning();

    if (!updatedSubscription) {
      return res
        .status(404)
        .json({ error: "No subscription found", success: false });
    }

    const [subscription] = await db
      .select({
        subscriptionId: subscriptionsTable.subscriptionId,
        flatTypeId: subscriptionsTable.flatTypeId,
        size: flatTypesTable.size,
        charges: subscriptionsTable.charges,
        effectiveFrom: subscriptionsTable.effectiveFrom,
        createdAt: subscriptionsTable.createdAt,
        updatedAt: subscriptionsTable.updatedAt,
      })
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.subscriptionId, subscriptionId))
      .innerJoin(
        flatTypesTable,
        eq(flatTypesTable.flatTypeId, subscriptionsTable.flatTypeId),
      );

    return res.status(200).json({
      subscription,
      message: "Subscription has been updated successfully",
      success: true,
    });
  } catch (error) {}
}

async function deleteSubscriptionHandler(req: Request, res: Response) {
  try {
    let { subscriptionId, societyId } = req.params;
    console.log(
      `Request recieved at /api/society/${societyId}/subscriptions/${subscriptionId}`,
    );

    const validationResult = validateUuid.safeParse({ id: subscriptionId });

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error?.message,
        success: false,
      });
    }

    subscriptionId = validationResult.data.id;

    const [subscription] = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.subscriptionId, subscriptionId));

    if (!subscription) {
      return res
        .status(404)
        .json({ error: "No subscription found", success: false });
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const subscriptionDate = subscription.effectiveFrom;
    const subscriptionMonth = new Date(subscriptionDate).getMonth();
    const subscriptionYear = new Date(subscriptionDate).getFullYear();

    if (
      subscriptionYear < currentYear ||
      (subscriptionYear === currentYear && subscriptionMonth <= currentMonth)
    ) {
      return res.status(400).json({
        error:
          "You can't delete the current's or earlier's month subscription.",
        success: false,
      });
    }

    await db
      .delete(subscriptionsTable)
      .where(eq(subscriptionsTable.subscriptionId, subscriptionId));

    return res.status(200).json({
      message: "Subscription has been deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("SUBSCRIPTION[:ID][DELETE]", error);
    return res
      .status(500)
      .json({ error: "Something went wrong", success: false });
  }
}

export {
  getSubscriptionHandler,
  createSubscriptionHandler,
  updateSubscriptionHandler,
  deleteSubscriptionHandler,
  getAllSubscriptionsHandler,
};
