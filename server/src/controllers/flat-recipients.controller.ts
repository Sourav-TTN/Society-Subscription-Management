import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";
import { flatRecipientsTable, flatsTable, usersTable } from "../db/schema.js";

async function getFlatRecipientsHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    console.log(
      `Request received at /api/society/${societyId}/flat-recipients`,
    );

    type FlatRecipient = {
      flatRecipientId: string;
      flatId: string;
      ownerId: string;
      isCurrentOwner: boolean;
      ownerName: string;
      ownerEmail: string;
      flat: string;
    };

    const flatRecipientsResult = await db.execute<FlatRecipient>(sql`
        select 
            fr.flat_recipient_id as "flatRecipientId",
            fr.flat_id as "flatId",
            fr.owner_id as "ownerId",
            fr.is_current_owner as "isCurrentOwner",
            u.name as "ownerName",
            u.email as "ownerEmail",
            concat(f.flat_block, '-', f.flat_floor, '-', f.flat_number) as "flat"
        from ${flatRecipientsTable} fr
        join ${usersTable} u on u.user_id = fr.owner_id
        join ${flatsTable} f on f.flat_id = fr.flat_id
        where f.society_id = ${societyId} and f.is_deleted = ${false} and fr.is_current_owner = ${true}
        order by f.flat_number, f.flat_floor, f.flat_block;
     `);

    const flatRecipients = flatRecipientsResult.rows;

    return res.status(200).json({
      success: true,
      flatRecipients,
      message: "Flat recipients retrieved successfully",
    });
  } catch (error) {
    console.error("FLAT-RECIPIENTS[ALL][GET]:", error);
    return res.status(500).json({
      success: false,
      error: "Something went wrong",
    });
  }
}

export { getFlatRecipientsHandler };
