import {
  firebaseTokensTable,
  flatRecipientsTable,
  type FlatRecipientSelectType,
} from "../db/schema.js";
import express from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { validateUuid } from "../lib/utils.js";
import { getSocietyMiddleware } from "../middlewares/society.middleware.js";

const router = express.Router({ mergeParams: true });

router.post("/save-token", getSocietyMiddleware, async (req, res) => {
  try {
    const { societyId } = req.society;
    console.log(
      `Request received at /api/society/${societyId}/firebase/save-token`,
    );

    let { token, userId } = req.body;

    const validationResult = validateUuid.safeParse({ id: userId });

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.message,
        success: false,
      });
    }

    userId = validationResult.data.id;

    if (!token) {
      return res
        .status(400)
        .json({ error: "No token provided", success: false });
    }

    const flatRecipientsResult = await db.execute<FlatRecipientSelectType>(sql`
        select
          fr.flat_recipient_id as "flatRecipientId"
        from ${flatRecipientsTable} fr
        where fr.owner_id = ${userId} and fr.is_current_owner = ${true};
    `);

    const flatRecipientsIds = flatRecipientsResult.rows.map(
      (t) => t.flatRecipientId,
    );

    if (flatRecipientsIds.length <= 0) {
      return res.status(404).json({
        error: "No flat recipient found",
        success: false,
      });
    }

    await db.execute(sql`
        insert into ${firebaseTokensTable} (token_id, flat_recipient_id, society_id)
        values ${sql.join(
          flatRecipientsIds.map((id) => {
            return sql`(${token}, ${id}, ${societyId})`;
          }),
          sql`, `,
        )};
    `);

    return res
      .status(200)
      .json({ message: "Token saved succesfully", success: true });
  } catch (error) {
    console.error("FIREBASE[SAVE-TOKEN][POST]:", error);
    return res.status(500).json({
      error: "Something went wrong",
      success: false,
    });
  }
});

export default router;
