import type { Request, Response } from "express";
import {
  flatsTable,
  notificationsTable,
  flatRecipientsTable,
  notificationRecipientsTable,
} from "../db/schema.js";
import z from "zod";
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";
import { validateUuid } from "../lib/utils.js";

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

export { sendNotificationHandler, getNotificationHistoryHandler };
