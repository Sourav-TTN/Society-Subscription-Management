import {
  flatsTable,
  usersTable,
  billsTable,
  paymentsTable,
  flatTypesTable,
  subscriptionsTable,
  flatRecipientsTable,
  type UserSelectType,
} from "../db/schema.js";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { validateUuid } from "../lib/utils.js";
import type { Request, Response } from "express";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

async function getMonthlyCollectionTrendsHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;

    const validationResult = z
      .object({
        year: z.coerce.number().int().min(1000).max(9999).optional(),
      })
      .safeParse(req.query);

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.message,
        success: false,
      });
    }

    let currentYear = new Date().getFullYear();
    let { year = currentYear } = validationResult.data;

    type MonthlyRow = {
      month: number;
      year: number;
      collected: string | number;
      totalBilled: string | number;
      pendingCount: string | number;
      paidCount: string | number;
    };

    const monthlyDataResults = await db.execute<MonthlyRow>(sql`
      select
        b.month as "month",
        b.year as "year",
        sum(case when b.status = 'paid' then s.charges else 0 end) as "collected",
        sum(s.charges) as "totalBilled",
        sum(case when b.status = 'pending' then s.charges else 0 end) as "pendingCount",
        count(case when b.status = 'paid' then 1 end) as "paidCount"
      from ${billsTable} b
      join ${subscriptionsTable} s on s.subscription_id = b.subscription_id
      join ${flatRecipientsTable} fr on fr.flat_recipient_id = b.flat_recipient_id
      join ${flatsTable} f on f.flat_id = fr.flat_id
      where f.society_id = ${societyId} and b.year = ${year}
      group by b.year, b.month
      order by b.month asc;
      `);

    const monthlyData = monthlyDataResults.rows;

    const formattedData = monthlyData.map((row) => ({
      month: MONTH_NAMES[row.month - 1],
      monthNumber: row.month,
      collected: Number(row.collected),
      totalBilled: Number(row.totalBilled),
      pendingCount: Number(row.pendingCount),
      paidCount: Number(row.paidCount),
      collectionRate:
        Number(row.totalBilled) > 0
          ? (Number(row.collected) / Number(row.totalBilled)) * 100
          : 0,
    }));

    res.json({
      success: true,
      data: {
        year,
        monthlyTrends: formattedData,
      },
    });
  } catch (error) {
    console.error("DASHBOARD[MONTHLY-TRENDS][GET]:", error);
    res.status(500).json({
      error: "Failed to fetch monthly trends",
      success: false,
    });
  }
}

async function getPaymentMethodDistributionHandler(
  req: Request,
  res: Response,
) {
  try {
    const { societyId } = req.society;

    const validationResult = z
      .object({
        month: z.coerce.number().int().min(1).max(12).optional(),
        year: z.coerce.number().int().min(1000).max(9999).optional(),
      })
      .safeParse(req.query);

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.message,
        success: false,
      });
    }

    let currentYear = new Date().getFullYear();

    let { year = currentYear, month } = validationResult.data;

    type PaymentMethodRow = {
      paymentVia: string;
      totalAmount: string | number;
      transactionCount: string | number;
    };

    const paymentMethodsDataResults = await db.execute<PaymentMethodRow>(sql`
      select
        p.payment_via as "paymentVia",
        sum(p.amount) as "totalAmount",
        count(p.payment_id) as "transactionCount"
      from ${paymentsTable} p
      join ${billsTable} b on b.bill_id = p.bill_id
      join ${flatRecipientsTable} fr on fr.flat_recipient_id = b.flat_recipient_id
      join ${flatsTable} f on f.flat_id = fr.flat_id
      where f.society_id = ${societyId} and b.year = ${year}
      ${month && sql` and b.month = ${month}`}
      group by p.payment_via;
    `);

    const paymentMethodsData = paymentMethodsDataResults.rows;

    const formattedData = paymentMethodsData.map((row) => ({
      method: row.paymentVia.toUpperCase() || "UNKNOWN",
      amount: Number(row.totalAmount),
      count: Number(row.transactionCount),
    }));

    const totalAmount = formattedData.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    const dataWithPercentage = formattedData.map((item) => ({
      ...item,
      percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
    }));

    res.json({
      success: true,
      data: {
        period: {
          year: year ? year : "all",
          month: month ? month : "all",
        },
        distribution: dataWithPercentage,
        totalAmount,
      },
    });
  } catch (error) {
    console.error("DASHBOARD[PAYMENT-METHODS][GET]:", error);
    res.status(500).json({
      error: "Failed to fetch payment method distribution",
      success: false,
    });
  }
}

async function getRevenueVsOutstandingHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;

    const validationResult = z
      .object({
        month: z.coerce.number().int().min(1).max(12).optional(),
        year: z.coerce.number().int().min(1000).max(9999).optional(),
      })
      .safeParse(req.query);

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.message,
        success: false,
      });
    }

    let currentYear = new Date().getFullYear();

    let { year = currentYear, month } = validationResult.data;

    type RevenueVsOutstandingRow = {
      month: number;
      year: number;
      revenue: string | number;
      outstanding: string | number;
      totalBilled: string | number;
    };

    const monthlyComparisonResults =
      await db.execute<RevenueVsOutstandingRow>(sql`
        select
          b.month as "month",
          b.year as "year",
          sum(case when b.status = 'paid' then s.charges else 0 end) as "revenue",
          sum(case when b.status = 'pending' then s.charges else 0 end) as "outstanding",
          sum(s.charges) as "totalBilled"
        from ${billsTable} b
        join ${subscriptionsTable} s on s.subscription_id = b.subscription_id
        join ${flatRecipientsTable} fr on fr.flat_recipient_id = b.flat_recipient_id
        join ${flatsTable} f on f.flat_id = fr.flat_id
        where f.society_id = ${societyId} and b.year = ${year} ${month && sql`and b.month = ${month}`}
        group by b.year, b.month
        order by b.month asc;
    `);

    const monthlyComparisonData = monthlyComparisonResults.rows;

    const formattedData = monthlyComparisonData.map((row) => ({
      month: MONTH_NAMES[row.month - 1],
      monthNumber: row.month,
      revenue: Number(row.revenue),
      outstanding: Number(row.outstanding),
      totalBilled: Number(row.totalBilled),
    }));

    const yearlyTotal = formattedData.reduce(
      (acc, item) => ({
        totalRevenue: acc.totalRevenue + item.revenue,
        totalOutstanding: acc.totalOutstanding + item.outstanding,
      }),
      { totalRevenue: 0, totalOutstanding: 0 },
    );

    res.json({
      success: true,
      data: {
        year,
        monthlyData: formattedData,
        yearlySummary: yearlyTotal,
      },
    });
  } catch (error) {
    console.error("DASHBOARD[REVENUE-OUTSTANDING][GET]:", error);
    res.status(500).json({
      error: "Failed to fetch revenue vs outstanding data",
      success: false,
    });
  }
}

async function getCompleteDashboardDataHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;

    const validationResult = z
      .object({
        month: z.coerce.number().int().min(1).max(12).optional(),
        year: z.coerce.number().int().min(1000).max(9999).optional(),
      })
      .safeParse(req.query);

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.message,
        success: false,
      });
    }

    let currentYear = new Date().getFullYear();

    let { year = currentYear, month } = validationResult.data;

    type OverviewRow = {
      totalCollected: string | number;
      totalPending: string | number;
      paidBillsCount: string | number;
      pendingBillsCount: string | number;
    };

    const overviewResult = await db.execute<OverviewRow>(sql`
      select
        sum(case when b.status = 'paid' then s.charges else 0 end) as "totalCollected",
        sum(case when b.status = 'pending' then s.charges else 0 end) as "totalPending",
        count(case when b.status = 'paid' then 1 end) as "paidBillsCount",
        count(case when b.status = 'pending' then 1 end) as "pendingBillsCount"
      from ${billsTable} b
      join ${subscriptionsTable} s on s.subscription_id = b.subscription_id
      join ${flatRecipientsTable} fr on fr.flat_recipient_id = b.flat_recipient_id
      join ${flatsTable} f on f.flat_id = fr.flat_id
      where f.society_id = ${societyId}
        and b.year = ${year}
        ${month ? sql`and b.month = ${month}` : sql``}
    `);

    const overview = overviewResult.rows[0];

    const totalCollected = Number(overview?.totalCollected || 0);
    const totalPending = Number(overview?.totalPending || 0);
    const collectionRate =
      totalCollected + totalPending > 0
        ? (totalCollected / (totalCollected + totalPending)) * 100
        : 0;
    const pendingBillsCount = Number(overview?.pendingBillsCount || 0);
    const paidBillsCount = Number(overview?.paidBillsCount || 0);

    type ActiveFlatsRow = {
      activeFlats: string | number;
    };

    const activeFlatsResult = await db.execute<ActiveFlatsRow>(sql`
      select count(*) as "activeFlats"
      from ${flatRecipientsTable} fr
      join ${flatsTable} f on f.flat_id = fr.flat_id
      where f.society_id = ${societyId} and fr.is_current_owner = ${true} 
      and extract(year from f.created_at) = ${year};
    `);

    const activeFlatsRow = activeFlatsResult.rows[0];
    const activeFlats = Number(activeFlatsRow?.activeFlats ?? 0);

    res.json({
      success: true,
      data: {
        overview: {
          activeFlats,
          totalPending,
          totalCollected,
          paidBillsCount,
          collectionRate,
          pendingBillsCount,
        },
      },
    });
  } catch (error) {
    console.error("DASHBOARD[COMPLETE-DATA][GET]:", error);
    res.status(500).json({
      error: "Failed to fetch complete dashboard data",
      success: false,
    });
  }
}

type FlatWithRecipient = {
  flatRecipientId: string;
  isCurrentOwner: boolean;
  from: Date;
  to: Date | null;
  flatId: string;
  flatBlock: string;
  flatFloor: number;
  flatNumber: string;
  flatSize: number;
};

type OverviewData = {
  total_paid: string;
  total_pending: string;
  pending_count: string;
  paid_count: string;
};

type MonthlyTrendData = {
  month: number;
  paid_amount: string;
  pending_amount: string;
  total_billed: string;
};

type OutstandingBillData = {
  billId: string;
  month: number;
  year: number;
  amount: string;
  flat_address: string;
};

type RecentPaymentData = {
  paymentId: string;
  amount: string;
  paymentVia: string;
  paidAt: Date;
  month: number;
  year: number;
  flat_address: string;
};

type PaymentMethodData = {
  paymentVia: string;
  total_amount: string;
};

type UserDashboardResponse = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  flats: Array<{
    id: string;
    address: string;
    size: number;
    isCurrentOwner: boolean;
  }>;
  overview: {
    totalPaid: number;
    totalPending: number;
    totalOutstanding: number;
    pendingBillsCount: number;
    paidBillsCount: number;
    paymentComplianceRate: number;
  };
  monthlyTrends: Array<{
    month: string;
    monthNumber: number;
    paidAmount: number;
    pendingAmount: number;
    totalBilled: number;
    paymentRate: number;
  }>;
  outstandingBills: Array<{
    id: string;
    month: string;
    year: number;
    amount: number;
    flatAddress: string;
  }>;
  recentPayments: Array<{
    id: string;
    amount: number;
    method: string;
    paidAt: Date;
    period: string;
    flatAddress: string;
  }>;
  paymentMethods: Array<{
    method: string;
    amount: number;
  }>;
};

async function getCompleteUserDashboardDataHandler(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const { societyId } = req.society;
    let { userId } = req.params;
    const { year } = req.query;

    const validationResult = validateUuid.safeParse({ id: userId });

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.message,
        success: false,
      });
    }

    userId = validationResult.data.id;
    const targetYear = year
      ? parseInt(year as string)
      : new Date().getFullYear();

    const userResult = await db.execute<UserSelectType>(sql`
      SELECT
        u.user_id as "userId",
        u.name as "name",
        u.email as "email",
        u.society_id as "societyId",
        u.created_at as "createdAt",
        u.updated_at as "updatedAt"
      FROM ${usersTable} u
      WHERE u.user_id = ${userId} AND u.society_id = ${societyId}
    `);

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        success: false,
      });
    }

    const flatsResult = await db.execute<FlatWithRecipient>(sql`
      SELECT 
        fr.flat_recipient_id as "flatRecipientId",
        fr.is_current_owner as "isCurrentOwner",
        fr.from as "from",
        fr.to as "to",
        f.flat_id as "flatId",
        f.flat_block as "flatBlock",
        f.flat_floor as "flatFloor",
        f.flat_number as "flatNumber",
        ft.size as "flatSize"
      FROM ${flatRecipientsTable} fr
      JOIN ${flatsTable} f ON f.flat_id = fr.flat_id
      JOIN ${flatTypesTable} ft ON ft.flat_type_id = f.flat_type_id
      WHERE fr.owner_id = ${userId}
        AND f.society_id = ${societyId}
      ORDER BY fr.is_current_owner DESC, fr.from DESC
    `);

    const userFlats = flatsResult.rows;

    if (userFlats.length === 0) {
      return res.status(404).json({
        error: "No flats found for this user",
        success: false,
      });
    }

    const allFlatRecipientIds = userFlats.map((flat) => flat.flatRecipientId);

    const flatRecipientPlaceholders = sql.join(
      allFlatRecipientIds.map((id) => sql`${id}::uuid`),
      sql`, `,
    );

    const [
      overviewResult,
      monthlyTrendsResult,
      outstandingResult,
      recentPaymentsResult,
      paymentMethodsResult,
    ] = await Promise.all([
      db.execute<OverviewData>(sql`
        SELECT 
          COALESCE(SUM(CASE WHEN b.status = 'paid' THEN s.charges ELSE 0 END), 0) as total_paid,
          COALESCE(SUM(CASE WHEN b.status = 'pending' THEN s.charges ELSE 0 END), 0) as total_pending,
          COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN b.status = 'paid' THEN 1 END) as paid_count
        FROM ${billsTable} b
        JOIN ${subscriptionsTable} s ON s.subscription_id = b.subscription_id
        WHERE b.flat_recipient_id IN (${flatRecipientPlaceholders})
      `),
      db.execute<MonthlyTrendData>(sql`
        SELECT 
          b.month,
          COALESCE(SUM(CASE WHEN b.status = 'paid' THEN s.charges ELSE 0 END), 0) as paid_amount,
          COALESCE(SUM(CASE WHEN b.status = 'pending' THEN s.charges ELSE 0 END), 0) as pending_amount,
          COALESCE(SUM(s.charges), 0) as total_billed
        FROM ${billsTable} b
        JOIN ${subscriptionsTable} s ON s.subscription_id = b.subscription_id
        WHERE b.flat_recipient_id IN (${flatRecipientPlaceholders})
          AND b.year = ${targetYear}
        GROUP BY b.month
        ORDER BY b.month ASC
      `),
      db.execute<OutstandingBillData>(sql`
        SELECT 
          b.bill_id as "billId",
          b.month,
          b.year,
          s.charges as amount,
          CONCAT(f.flat_number, ', ', f.flat_floor, ', ', f.flat_block) as flat_address
        FROM ${billsTable} b
        JOIN ${subscriptionsTable} s ON s.subscription_id = b.subscription_id
        JOIN ${flatRecipientsTable} fr ON fr.flat_recipient_id = b.flat_recipient_id
        JOIN ${flatsTable} f ON f.flat_id = fr.flat_id
        WHERE b.flat_recipient_id IN (${flatRecipientPlaceholders})
          AND b.status = 'pending'
        ORDER BY b.year DESC, b.month DESC
        LIMIT 10
      `),
      db.execute<RecentPaymentData>(sql`
        SELECT 
          p.payment_id as "paymentId",
          p.amount,
          p.payment_via as "paymentVia",
          p.paid_at as "paidAt",
          b.month,
          b.year,
          CONCAT(f.flat_number, ', ', f.flat_floor, ', ', f.flat_block) as flat_address
        FROM ${paymentsTable} p
        JOIN ${billsTable} b ON b.bill_id = p.bill_id
        JOIN ${flatRecipientsTable} fr ON fr.flat_recipient_id = b.flat_recipient_id
        JOIN ${flatsTable} f ON f.flat_id = fr.flat_id
        WHERE b.flat_recipient_id IN (${flatRecipientPlaceholders})
        ORDER BY p.paid_at DESC
        LIMIT 10
      `),
      db.execute<PaymentMethodData>(sql`
        SELECT 
          p.payment_via as "paymentVia",
          COALESCE(SUM(p.amount), 0) as total_amount
        FROM ${paymentsTable} p
        JOIN ${billsTable} b ON b.bill_id = p.bill_id
        WHERE b.flat_recipient_id IN (${flatRecipientPlaceholders})
          AND EXTRACT(YEAR FROM p.paid_at) = ${targetYear}
        GROUP BY p.payment_via
      `),
    ]);

    const overview = overviewResult.rows[0];
    const monthlyTrends = monthlyTrendsResult.rows;
    const outstandingBills = outstandingResult.rows;
    const recentPayments = recentPaymentsResult.rows;
    const paymentMethods = paymentMethodsResult.rows;

    const totalPaid = Number(overview?.total_paid || 0);
    const totalPending = Number(overview?.total_pending || 0);
    const totalOutstanding = outstandingBills.reduce(
      (sum, row) => sum + Number(row.amount),
      0,
    );
    const paymentComplianceRate =
      totalPaid + totalPending > 0
        ? (totalPaid / (totalPaid + totalPending)) * 100
        : 0;

    const response: UserDashboardResponse = {
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
      },
      flats: userFlats.map((flat) => ({
        id: flat.flatId,
        address: `${flat.flatNumber}, Floor ${flat.flatFloor}, ${flat.flatBlock}`,
        size: flat.flatSize,
        isCurrentOwner: flat.isCurrentOwner,
      })),
      overview: {
        totalPaid,
        totalPending,
        totalOutstanding,
        pendingBillsCount: Number(overview?.pending_count || 0),
        paidBillsCount: Number(overview?.paid_count || 0),
        paymentComplianceRate: Math.round(paymentComplianceRate * 100) / 100,
      },
      monthlyTrends: monthlyTrends.map((row) => ({
        month: MONTH_NAMES[row.month - 1] ?? "",
        monthNumber: row.month,
        paidAmount: Number(row.paid_amount),
        pendingAmount: Number(row.pending_amount),
        totalBilled: Number(row.total_billed),
        paymentRate:
          Number(row.total_billed) > 0
            ? (Number(row.paid_amount) / Number(row.total_billed)) * 100
            : 0,
      })),
      outstandingBills: outstandingBills.map((row) => ({
        id: row.billId,
        month: MONTH_NAMES[row.month - 1] ?? "",
        year: row.year,
        amount: Number(row.amount),
        flatAddress: row.flat_address,
      })),
      recentPayments: recentPayments.map((row) => ({
        id: row.paymentId,
        amount: Number(row.amount),
        method: row.paymentVia?.toUpperCase(),
        paidAt: row.paidAt,
        period: `${MONTH_NAMES[row.month - 1]} ${row.year}`,
        flatAddress: row.flat_address,
      })),
      paymentMethods: paymentMethods.map((row) => ({
        method: row.paymentVia?.toUpperCase() || "UNKNOWN",
        amount: Number(row.total_amount),
      })),
    };

    return res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("COMPLETE_USER_DASHBOARD[GET]:", error);
    return res.status(500).json({
      error: "Failed to fetch complete user dashboard data",
      success: false,
    });
  }
}

export {
  getRevenueVsOutstandingHandler,
  getCompleteDashboardDataHandler,
  getMonthlyCollectionTrendsHandler,
  getPaymentMethodDistributionHandler,
  getCompleteUserDashboardDataHandler,
};
