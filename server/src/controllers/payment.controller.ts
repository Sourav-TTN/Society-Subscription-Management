import {
  billsTable,
  paymentsTable,
  subscriptionsTable,
  type BillSelectType,
  paymentsInsertSchema,
  type PaymentSelectType,
} from "../db/schema.js";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import type { Request, Response } from "express";
import z from "zod";

async function createPaymentHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    console.log(`Request received at /api/society/${societyId}/payments`);

    const validationResult = paymentsInsertSchema
      .extend({
        paidAt: z.coerce.date().optional(),
      })
      .safeParse(req.body);

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error,
        success: false,
      });
    }

    const { billId, amount, paymentVia, paidAt } = validationResult.data;

    const columns = [sql`bill_id`, sql`amount`, sql`payment_via`];
    const values: (string | Date)[] = [billId, amount, paymentVia];

    if (paidAt && paidAt <= new Date()) {
      columns.push(sql`paid_at`);
      values.push(paidAt);
    }

    const payment = await db.transaction(async (tx) => {
      const billResult = await tx.execute<
        BillSelectType & { charges: string }
      >(sql`
        select 
          b.bill_id as "billId",
          b.flat_recipient_id as "flatRecipientId",
          b.month as "month",
          b.year as "year",
          b.subscription_id as "subscriptionId",
          s.charges as "charges",
          b.status as "status",
          b.created_at as "createdAt",
          b.updated_at as "updatedAt"
          from ${billsTable} b
          join ${subscriptionsTable} s on s.subscription_id = b.subscription_id
          where b.bill_id = ${billId};
      `);

      const bill = billResult.rows[0];

      if (!bill) {
        throw new Error("Bill not found");
      }

      // console.log(bill);

      if (bill.status === "paid") {
        throw new Error("Bill's payment has already been paid");
      }

      if (Number(amount) != Number(bill.charges)) {
        throw new Error("Payment amount must be equal to the bill's charges.");
      }

      let paymentsResult = await tx.execute<
        Pick<PaymentSelectType, "paymentId">
      >(sql`
       insert into ${paymentsTable} (${sql.join(columns, sql`,`)})
       values (${sql.join(values, sql`,`)})
       returning payment_id as "paymentId"   
      `);

      await tx.execute(sql`
        update ${billsTable} set status = 'paid'
        where bill_id = ${billId};
      `);

      const { paymentId } = paymentsResult.rows[0]!;
      // console.log(paymentId);

      const { rows: payments } = await tx.execute<PaymentSelectType>(sql`
        select 
          p.payment_id as "paymentId",
          p.bill_id as "billId",
          p.amount as "amount",
          p.payment_via as "paymentVia",
          p.paid_at as "paidAt",
          p.created_at as "createdAt",
          p.updated_at as "updatedAt"
        from ${paymentsTable} p
        where p.payment_id = ${paymentId}
      `);

      // console.log(payments);

      return payments[0]!;
    });

    return res.status(201).json({
      message: "Payment done successfully",
      payment,
      success: true,
    });
  } catch (error) {
    console.error("PAYMENTS[CREATE][POST]:", error);

    if (error instanceof Error) {
      return res.status(400).json({
        error: error.message,
        success: false,
      });
    }

    return res.status(500).json({
      error: "Something went wrong",
      success: false,
    });
  }
}

export { createPaymentHandler };
