import {
  flatsTable,
  notificationsTable,
  flatRecipientsTable,
  firebaseTokensTable,
  notificationRecipientsTable,
  type FirebaseTokensSelectType,
  type FlatRecipientSelectType,
  type NotificationRecipientSelectType,
} from "../db/schema.js";
import z from "zod";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { validateUuid } from "../lib/utils.js";
import type { Request, Response } from "express";
import admin from "../services/firebase-admin.js";

async function sendNotificationHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    console.log(
      `Request received at /api/society/${societyId}/notifications/send`,
    );

    const sendNotificationsValidationSchema = z.object({
      title: z.string(),
      content: z.string(),
      sentBy: z.uuidv4(),
      flatRecipientsIds: z.array(z.uuidv4()),
    });

    const validationResult = sendNotificationsValidationSchema.safeParse(
      req.body,
    );

    if (validationResult.error) {
      return res.status(400).json({
        success: false,
        error: validationResult.error.message,
      });
    }

    const { title, content, sentBy, flatRecipientsIds } = validationResult.data;

    const flatRecipientsResult = await db.execute<{ flatRecipientId: string }>(
      sql`
        select fr.flat_recipient_id as "flatRecipientId"
        from ${flatRecipientsTable} fr
        join ${flatsTable} f on fr.flat_id = f.flat_id
        where fr.flat_recipient_id in (${sql.join(flatRecipientsIds, sql`, `)}) and f.society_id = ${societyId}
        and fr.is_current_owner = ${true}
      `,
    );

    const validFlatRecipientIds = flatRecipientsResult.rows.map(
      (row) => row.flatRecipientId,
    );

    if (validFlatRecipientIds.length == 0) {
      return res.status(400).json({
        success: false,
        error: "No valid flat recipients found for the provided IDs",
      });
    }

    const notificationResult = await db.execute<{
      notification_id: string;
    }>(sql`
        insert into ${notificationsTable} (title, content, sent_by, society_id)
        values (${title}, ${content}, ${sentBy}, ${societyId})
        returning notification_id
    `);

    const notificationId = notificationResult.rows[0]?.notification_id!;

    await db.execute(sql`
      insert into ${notificationRecipientsTable} (notification_id, flat_recipient_id)
      values ${sql.join(
        validFlatRecipientIds.map((id) => sql`(${notificationId}, ${id})`),
        sql`, `,
      )}
    `);

    const tokensResult = await db.execute<FirebaseTokensSelectType>(sql`
      select 
        f.token_id as "tokenId",
        f.flat_recipient_id as "flatRecipientId",
        f.society_id as "societyId",
        f.created_at as "createdAt",
        f.updated_at as "updatedAt"
      from ${firebaseTokensTable} f
      join ${flatRecipientsTable} fr on fr.flat_recipient_id = f.flat_recipient_id
      where f.flat_recipient_id in ${validFlatRecipientIds} and f.society_id = ${societyId}
    `);

    const tokens = tokensResult.rows.map((t) => t.tokenId);

    // console.log(tokens);

    await admin.messaging().sendEachForMulticast({
      notification: {
        title,
        body: content,
      },
      tokens,
    });

    return res.status(200).json({
      success: true,
      message: "Notification sent successfully",
      notificationId,
    });
  } catch (error) {
    console.error("NOTIFICATION[SEND][POST]:", error);
    return res.status(500).json({
      success: false,
      error: "Something went wrong",
    });
  }
}

async function getNotificationHistoryHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    let { adminId } = req.query;
    console.log(
      `Request received at /api/society/${societyId}/notifications/history`,
    );

    const validationResult = validateUuid.safeParse({ id: adminId });

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.message,
        success: false,
      });
    }

    adminId = validationResult.data.id;

    type NotificationHistoryType = {
      notificationId: string;
      title: string;
      content: string;
      total: number;
      sentAt: Date;
    };

    const notificationHistoryResult =
      await db.execute<NotificationHistoryType>(sql`
        select 
          n.notification_id as "notificationId",
          n.title as "title",
          n.content as "content",
          count(nr.notification_recipient_id) as "total",
          n.sent_at as "sentAt"
        from ${notificationsTable} n
        join ${notificationRecipientsTable} nr 
          on n.notification_id = nr.notification_id
        where n.sent_by = ${adminId}
        group by n.notification_id, n.title, n.content, n.sent_at
        order by n.sent_at desc
      `);

    const notificationHistory = notificationHistoryResult.rows;

    return res.status(200).json({
      message: "Notification history retrieved successfully",
      success: true,
      notifications: notificationHistory,
    });
  } catch (error) {
    console.error("NOTIFICATION[HISTORY][GET]:", error);
    return res.status(500).json({
      success: false,
      error: "Something went wrong",
    });
  }
}

async function getUserNotificationHistoryHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    let { userId } = req.params;

    console.log(
      `Request received at /api/society/${societyId}/notifications/users/${userId}`,
    );

    const validationResult = validateUuid.safeParse({ id: userId });

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.message,
        success: false,
      });
    }

    const flatRecipientsResult = await db.execute<FlatRecipientSelectType>(sql`
      select 
        fr.flat_recipient_id as "flatRecipientId",
        fr.flat_id as "flatId",
        fr.owner_id as "ownerId",
        fr.is_current_owner as "isCurrentOwner",
        fr.created_at as "createdAt",
        fr.updated_at as "updatedAt"
      from ${flatRecipientsTable} fr
      join ${flatsTable} f on fr.flat_id = f.flat_id
      where fr.owner_id = ${userId} and f.society_id = ${societyId}
      and fr.is_current_owner = ${true};
    `);

    const flatRecipients = flatRecipientsResult.rows;

    type NotificationRecipientResultsType = NotificationRecipientSelectType & {
      title: string;
      content: string;
      sentAt: Date;
    };

    const notificationRecipientsResult =
      await db.execute<NotificationRecipientResultsType>(sql`
      select
        nr.notification_recipient_id as "notificationRecipientId",
        nr.notification_id as "notificationId",
        nr.flat_recipient_id as "flatRecipientId",
        n.title as "title",
        n.content as "content",
        n.sent_at as "sentAt"
      from ${notificationRecipientsTable} nr
      join ${notificationsTable} n on nr.notification_id = n.notification_id
      where nr.flat_recipient_id in ${flatRecipients.map((fr) => fr.flatRecipientId)}
      order by n.sent_at desc;
    `);

    const notifications = notificationRecipientsResult.rows;

    return res.status(200).json({
      success: true,
      message: "User notifications retrieved successfully",
      notifications,
    });
  } catch (error) {
    console.error("NOTIFICATIONS[USERID][GET]:", error);
    return res.status(500).json({
      success: false,
      error: "Something went wrong",
    });
  }
}

export {
  sendNotificationHandler,
  getNotificationHistoryHandler,
  getUserNotificationHistoryHandler,
};
