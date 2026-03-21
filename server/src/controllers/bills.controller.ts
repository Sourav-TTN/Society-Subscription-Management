import z from "zod";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { validateUuid } from "../lib/utils.js";
import type { Request, Response } from "express";

import {
  flatsTable,
  usersTable,
  billsTable,
  paymentsTable,
  flatTypesTable,
  subscriptionsTable,
  type BillSelectType,
  flatRecipientsTable,
  type UserSelectType,
  type FlatRecipientSelectType,
} from "../db/schema.js";

type BillResultType = {
  billId: string;
  flatRecipientId: string;
  name: string;
  flat: string;
  month: number;
  year: number;
  subscriptionId: string;
  charges: string;
  status: "pending" | "paid";
  createdAt: Date;
  updatedAt: Date;
};

async function generateBillHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    const { flatRecipientId } = req.params;

    console.log(
      `Request received at /api/society/${societyId}/bills/generate/${flatRecipientId}`,
    );

    const validationResult = validateUuid.safeParse({
      id: flatRecipientId,
    });

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.message,
        success: false,
      });
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const existingBill = await db.execute<BillSelectType>(sql`
      select * from ${billsTable}
      where flat_recipient_id = ${flatRecipientId}
        and month = ${currentMonth}
        and year = ${currentYear}
    `);

    if (existingBill.rows.length > 0) {
      return res.status(400).json({
        error: "Bill already exists for this flat recipient",
        success: false,
      });
    }

    const subscriptionResult = await db.execute<{
      subscriptionId: string;
    }>(sql`
      select s.subscription_id as "subscriptionId"
      from ${subscriptionsTable} s
      join ${flatTypesTable} ft on ft.flat_type_id = s.flat_type_id
      join ${flatsTable} f on f.flat_type_id = ft.flat_type_id
      join ${flatRecipientsTable} fr on fr.flat_id = f.flat_id
      where fr.flat_recipient_id = ${flatRecipientId}
        and f.society_id = ${societyId}
        and f.is_deleted = ${false}
        and s.effective_from = (
          select max(s2.effective_from)
          from ${subscriptionsTable} s2
          where s2.flat_type_id = s.flat_type_id
            and s2.effective_from <= ${new Date(currentYear, currentMonth - 1, 1)}
        )
    `);

    const subscription = subscriptionResult.rows[0];

    if (!subscription) {
      return res.status(400).json({
        error: "No subscription found for this flat",
        success: false,
      });
    }

    await db.execute(sql`
      insert into ${billsTable}
        (flat_recipient_id, status, subscription_id, month, year)
      values
        (${flatRecipientId}, 'pending', ${subscription.subscriptionId}, ${currentMonth}, ${currentYear})
    `);

    const billResult = await db.execute<BillResultType>(sql`
      select 
        b.bill_id as "billId",
        b.flat_recipient_id as "flatRecipientId",
        u.name as "name",
        concat(f.flat_number, ', ', f.flat_floor, ', ', f.flat_block) as "flat",
        b.month as "month",
        b.year as "year",
        b.subscription_id as "subscriptionId",
        s.charges as "charges",
        b.status as "status",
        b.created_at as "createdAt",
        b.updated_at as "updatedAt"
      from ${billsTable} b
      join ${subscriptionsTable} s on s.subscription_id = b.subscription_id
      join ${flatRecipientsTable} fr on fr.flat_recipient_id = b.flat_recipient_id
      join ${usersTable} u on u.user_id = fr.owner_id
      join ${flatsTable} f on f.flat_id = fr.flat_id
      where b.flat_recipient_id = ${flatRecipientId}
        and b.month = ${currentMonth}
        and b.year = ${currentYear}
      limit 1
    `);

    return res.status(201).json({
      bill: billResult.rows[0],
      message: "Bill generated successfully",
      success: true,
    });
  } catch (error) {
    console.error("BILL[GENERATE][POST]:", error);
    return res.status(500).json({
      error: "Something went wrong",
      success: false,
    });
  }
}

async function getAllBillsHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;

    console.log(`Request received at /api/society/${societyId}/bills`);

    let query = req.query;

    const filterValidationResult = z
      .object({
        month: z.coerce.number().int().min(1).max(12).optional(),
        year: z.coerce.number().int().min(1000).max(9999).optional(),
      })
      .safeParse(query);

    if (filterValidationResult.error) {
      return res
        .status(400)
        .json({ error: filterValidationResult.error.message, success: false });
    }

    let currentMonth = new Date().getMonth() + 1;
    let currentYear = new Date().getFullYear();

    let { month = currentMonth, year = currentYear } =
      filterValidationResult.data;

    // find all the bills for the given month and the year with for each flat according to the flat recipient and flat must not be deleted

    let billsResult = await db.execute<BillResultType>(sql`
          select 
          b.bill_id as "billId",
          b.flat_recipient_id as "flatRecipientId",
          u.name as "name",
          concat(f.flat_number, ', ', f.flat_floor, ', ', f.flat_block) as "flat",
          b.month as "month",
          b.year as "year",
          b.subscription_id as "subscriptionId",
          s.charges as "charges",
          b.status as "status",
          b.created_at as "createdAt",
          b.updated_at as "updatedAt"
          from ${billsTable} b
          join ${subscriptionsTable} s on s.subscription_id = b.subscription_id
          join ${flatRecipientsTable} fr on fr.flat_recipient_id = b.flat_recipient_id
          join ${usersTable} u on u.user_id = fr.owner_id
          join ${flatsTable} f on f.flat_id = fr.flat_id
          where (fr.is_current_owner = ${true} and f.is_deleted = ${false}) 
          or (fr.is_current_owner = ${false} and f.is_deleted = ${false} and b.status = 'pending')
          ${month && sql` and b.month = ${month}`}
          ${year && sql` and b.year = ${year}`}
        `);

    let bills = billsResult.rows;

    if (month == currentMonth && year == currentYear && bills.length == 0) {
      type FlatSubscriptionsType = {
        subscriptionId: string;
        effectiveFrom: Date;
        flatRecipientId: string;
        flatId: string;
        societyId: string;
        size: number;
        flatTypeId: string;
      };

      let flatsSubscriptionsResult =
        await db.execute<FlatSubscriptionsType>(sql`
        select 
        s.subscription_id as "subscriptionId",
        s.effective_from as "effectiveFrom",
        fr.flat_recipient_id as "flatRecipientId",
        f.flat_id as "flatId",
        f.society_id as "societyId",
        ft.size as "size",
        s.flat_type_id as "flatTypeId"
        from ${subscriptionsTable} s
        join ${flatTypesTable} ft on ft.flat_type_id = s.flat_type_id
        join ${flatsTable} f on f.flat_type_id = ft.flat_type_id
        join ${flatRecipientsTable} fr on fr.flat_id = f.flat_id
        where f.society_id = ${societyId} and f.is_deleted = ${false} and fr.is_current_owner = ${true} and
        s.effective_from = (
          select max(s2.effective_from) from ${subscriptionsTable} s2 
          where s.flat_type_id = s2.flat_type_id and s2.effective_from < ${new Date(currentYear, currentMonth - 1, 1)}
        )
      `);

      let flatsSubscriptions = flatsSubscriptionsResult.rows;

      if (flatsSubscriptions.length == 0) {
        return res
          .status(400)
          .json({ error: "Create flats first", success: false });
      }

      await db.execute(sql`
        insert into ${billsTable} (flat_recipient_id, status, subscription_id, month, year)
        values ${sql.join(
          flatsSubscriptions.map(
            (row) =>
              sql`(${row.flatRecipientId}, 'pending', ${row.subscriptionId}, ${currentMonth}, ${currentYear})`,
          ),
          sql`,`,
        )};
        `);

      billsResult = await db.execute<BillResultType>(sql`
        select 
        b.bill_id as "billId",
        b.flat_recipient_id as "flatRecipientId",
        u.name as "name",
        concat(f.flat_number, ', ', f.flat_floor, ', ', f.flat_block) as "flat",
        b.month as "month",
        b.year as "year",
        b.subscription_id as "subscriptionId",
        s.charges as "charges",
        b.status as "status",
        b.created_at as "createdAt",
        b.updated_at as "updatedAt"
        from ${billsTable} b
        join ${subscriptionsTable} s on s.subscription_id = b.subscription_id
        join ${flatRecipientsTable} fr on fr.flat_recipient_id = b.flat_recipient_id
        join ${usersTable} u on u.user_id = fr.owner_id
        join ${flatsTable} f on f.flat_id = fr.flat_id
        where fr.is_current_owner = ${true} and f.is_deleted = ${false}
        ${month && sql` and b.month = ${month}`}
        ${year && sql` and b.year = ${year}`}
      `);

      bills = billsResult.rows;
    }

    return res
      .status(200)
      .json({ bills, message: "All bills found successfully", success: true });
  } catch (error) {
    console.error("BILLS[ALL][GET]:", error);
    return res.status(500).json({
      error: "Something went wrong",
      success: false,
    });
  }
}

async function updateBillHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    let { billId } = req.params;
    const body = req.body;
    console.log(
      `Request received at /api/society/${societyId}/bills/${billId}`,
    );

    let validationResult = validateUuid
      .extend({
        paymentMode: z.enum(["cash", "upi", "online"]),
        paidAt: z.coerce.date().optional(),
      })
      .safeParse({ id: billId, ...body });

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.message,
        success: false,
      });
    }

    billId = validationResult.data.id;
    let { paymentMode, paidAt } = validationResult.data;

    const existingBillResult = await db.execute<BillSelectType>(sql`
        select * from ${billsTable}
        where bill_id = ${billId}
      `);

    const existingBill = existingBillResult.rows[0];

    if (!existingBill) {
      return res
        .status(404)
        .json({ error: "No bill found with such id", success: false });
    }

    if (existingBill.status == "paid") {
      return res.status(400).json({
        error: "Payment has already been made.",
        success: false,
      });
    }

    await db.execute(sql`
        update ${billsTable}
        set status = 'paid'
        where bill_id = ${billId}
    `);

    const updatedBillResult = await db.execute<BillResultType>(sql`
      select 
        b.bill_id as "billId",
        b.flat_recipient_id as "flatRecipientId",
        u.name as "name",
        concat(f.flat_number, ', ', f.flat_floor, ', ', f.flat_block) as "flat",
        b.month as "month",
        b.year as "year",
        b.subscription_id as "subscriptionId",
        s.charges as "charges",
        b.status as "status",
        b.created_at as "createdAt",
        b.updated_at as "updatedAt"
        from ${billsTable} b
        join ${subscriptionsTable} s on s.subscription_id = b.subscription_id
        join ${flatRecipientsTable} fr on fr.flat_recipient_id = b.flat_recipient_id
        join ${usersTable} u on u.user_id = fr.owner_id
        join ${flatsTable} f on f.flat_id = fr.flat_id
        where b.bill_id = ${billId}
      `);

    const updatedBill = updatedBillResult.rows[0]!;

    const columns = [sql`bill_id`, sql`amount`, sql`payment_via`];
    const values: (string | Date)[] = [
      updatedBill.billId,
      updatedBill.charges,
      paymentMode,
    ];

    if (paidAt) {
      columns.push(sql`paid_at`);
      values.push(paidAt);
    }

    await db.execute(sql`
      insert into ${paymentsTable} (${sql.join(columns, sql`, `)})
      values (${sql.join(values, sql`, `)})
    `);

    return res.status(200).json({
      message: "Bill has been updated successfully",
      bill: updatedBill,
      success: true,
    });
  } catch (error) {
    console.error("BILLS[UPDATE][PATCH]:", error);
    return res.status(500).json({
      error: "Something went wrong",
      success: false,
    });
  }
}

async function getAllPendingBillsHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;

    console.log(`Request received at /api/society/${societyId}/bills/pending`);

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    let billsResult = await db.execute<BillResultType>(sql`
      select 
        b.bill_id as "billId",
        b.flat_recipient_id as "flatRecipientId",
        u.name as "ownerName",
        u.email as "ownerEmail",
        concat(f.flat_number, ', ', f.flat_floor, ', ', f.flat_block) as "flat",
        b.month as "month",
        b.year as "year",
        b.subscription_id as "subscriptionId",
        s.charges as "charges",
        b.status as "status",
        b.created_at as "createdAt",
        b.updated_at as "updatedAt"
      from ${billsTable} b
      join ${subscriptionsTable} s on s.subscription_id = b.subscription_id
      join ${flatRecipientsTable} fr on fr.flat_recipient_id = b.flat_recipient_id
      join ${usersTable} u on u.user_id = fr.owner_id
      join ${flatsTable} f on f.flat_id = fr.flat_id
      where f.is_deleted = ${false}
        and b.month = ${currentMonth}
        and b.year = ${currentYear}
        and b.status = 'pending'
      order by f.flat_number, f.flat_floor, f.flat_block
    `);

    let bills = billsResult.rows;

    if (bills.length === 0) {
      type FlatSubscriptionsType = {
        subscriptionId: string;
        effectiveFrom: Date;
        flatRecipientId: string;
        flatId: string;
        societyId: string;
        size: number;
        flatTypeId: string;
      };

      let flatsSubscriptionsResult =
        await db.execute<FlatSubscriptionsType>(sql`
        select 
          s.subscription_id as "subscriptionId",
          s.effective_from as "effectiveFrom",
          fr.flat_recipient_id as "flatRecipientId",
          f.flat_id as "flatId",
          f.society_id as "societyId",
          ft.size as "size",
          s.flat_type_id as "flatTypeId"
        from ${subscriptionsTable} s
        join ${flatTypesTable} ft on ft.flat_type_id = s.flat_type_id
        join ${flatsTable} f on f.flat_type_id = ft.flat_type_id
        join ${flatRecipientsTable} fr on fr.flat_id = f.flat_id
        where f.society_id = ${societyId} 
          and f.is_deleted = ${false} 
          and fr.is_current_owner = ${true}
          and s.effective_from = (
            select max(s2.effective_from) 
            from ${subscriptionsTable} s2 
            where s.flat_type_id = s2.flat_type_id 
              and s2.effective_from <= ${new Date(currentYear, currentMonth - 1, 1)}
          )
      `);

      let flatsSubscriptions = flatsSubscriptionsResult.rows;

      if (flatsSubscriptions.length === 0) {
        return res.status(200).json({
          bills: [],
          message: "No pending bills found for the current month",
          success: true,
        });
      }

      await db.execute(sql`
        insert into ${billsTable} (flat_recipient_id, status, subscription_id, month, year)
        values ${sql.join(
          flatsSubscriptions.map(
            (row) =>
              sql`(${row.flatRecipientId}, 'pending', ${row.subscriptionId}, ${currentMonth}, ${currentYear})`,
          ),
          sql`,`,
        )}
      `);

      billsResult = await db.execute<BillResultType>(sql`
        select 
          b.bill_id as "billId",
          b.flat_recipient_id as "flatRecipientId",
          u.name as "name",
          concat(f.flat_number, ', ', f.flat_floor, ', ', f.flat_block) as "flat",
          b.month as "month",
          b.year as "year",
          b.subscription_id as "subscriptionId",
          s.charges as "charges",
          b.status as "status",
          b.created_at as "createdAt",
          b.updated_at as "updatedAt"
        from ${billsTable} b
        join ${subscriptionsTable} s on s.subscription_id = b.subscription_id
        join ${flatRecipientsTable} fr on fr.flat_recipient_id = b.flat_recipient_id
        join ${usersTable} u on u.user_id = fr.owner_id
        join ${flatsTable} f on f.flat_id = fr.flat_id
        where fr.is_current_owner = ${true} 
          and f.is_deleted = ${false}
          and b.month = ${currentMonth}
          and b.year = ${currentYear}
          and b.status = 'pending'
        order by f.flat_number, f.flat_floor, f.flat_block
      `);

      bills = billsResult.rows;
    }

    return res.status(200).json({
      bills,
      message: "Pending bills retrieved successfully",
      success: true,
    });
  } catch (error) {
    console.error("PENDING BILLS[GET]:", error);
    return res.status(500).json({
      error: "Something went wrong",
      success: false,
    });
  }
}

async function getAllUserBillsHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    let { userId } = req.params;

    console.log(
      `Request received at /api/society/${societyId}/bills/users/${userId}`,
    );

    const validationResult = validateUuid.safeParse({ id: userId });

    if (!validationResult.success) {
      return res.status(400).json({
        error: validationResult.error.message,
        success: false,
      });
    }

    userId = validationResult.data.id;

    const userResult = await db.execute<UserSelectType>(sql`
      select 
        u.name as "name",
        u.email as "email",
        u.society_id as "societyId",
        u.user_id as "userId",
        u.created_at as "createdAt",
        u.updated_at as "updatedAt"
      from ${usersTable} u
      where u.user_id = ${userId} and u.society_id = ${societyId}
    `);

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        error: "No user found with such id",
        success: false,
      });
    }

    let query = req.query;

    const filterValidationResult = z
      .object({
        month: z.coerce.number().int().min(1).max(12).optional(),
        year: z.coerce.number().int().min(1000).max(9999).optional(),
      })
      .safeParse(query);

    if (filterValidationResult.error) {
      return res
        .status(400)
        .json({ error: filterValidationResult.error.message, success: false });
    }

    const { month, year } = filterValidationResult.data;

    type UserBillResultType = BillResultType & {
      from: Date;
      to: Date | null;
      paidAt: Date | null;
      paymentMode: "cash" | "upi" | "online" | null;
      amount: number;
    };

    const userBillsResult = await db.execute<UserBillResultType>(sql`
      select
        b.bill_id as "billId",
        b.flat_recipient_id as "flatRecipientId",
        u.name as "name",
        concat(f.flat_number, ', ', f.flat_floor, ', ', f.flat_block) as "flat",
        fr.from as "from",
        fr.to as "to",
        b.month as "month",
        b.year as "year",
        b.subscription_id as "subscriptionId",
        s.charges as "charges",
        b.status as "status",
        p.paid_at as "paidAt",
        p.payment_via as "paymentMode",
        p.amount as "amount",
        b.created_at as "createdAt",
        b.updated_at as "updatedAt"
      from ${billsTable} b
      left join ${paymentsTable} p on p.bill_id = b.bill_id
      join ${subscriptionsTable} s on s.subscription_id = b.subscription_id
      join ${flatRecipientsTable} fr on fr.flat_recipient_id = b.flat_recipient_id
      join ${usersTable} u on u.user_id = fr.owner_id
      join ${flatsTable} f on f.flat_id = fr.flat_id
      where fr.owner_id = ${userId}
        and f.society_id = ${societyId}
        ${month !== undefined ? sql` and b.month = ${month}` : sql``}
        ${year !== undefined ? sql` and b.year = ${year}` : sql``}
      order by b.year desc, b.month desc
    `);

    const bills = userBillsResult.rows;

    return res.status(200).json({
      message: "User bills retrieved successfully",
      bills,
      success: true,
    });
  } catch (error) {
    console.error("BILLS[USER][GET]:", error);
    return res.status(500).json({
      error: "Something went wrong",
      success: false,
    });
  }
}

export {
  updateBillHandler,
  getAllBillsHandler,
  generateBillHandler,
  getAllUserBillsHandler,
  getAllPendingBillsHandler,
};
