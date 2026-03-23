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
    const { year } = req.query;

    const targetYear = year
      ? parseInt(year as string)
      : new Date().getFullYear();

    const monthlyData = await db.execute(sql`
      SELECT 
        b.month,
        b.year,
        COALESCE(SUM(CASE WHEN b.status = 'paid' THEN s.charges ELSE 0 END), 0) as collected,
        COALESCE(SUM(s.charges), 0) as total_billed,
        COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN b.status = 'paid' THEN 1 END) as paid_count
      FROM ${billsTable} b
      JOIN ${subscriptionsTable} s ON s.subscription_id = b.subscription_id
      WHERE b.year = ${targetYear}
        AND EXISTS (
          SELECT 1 FROM ${flatsTable} f
          WHERE f.society_id = ${societyId}
        )
      GROUP BY b.month, b.year
      ORDER BY b.month ASC
    `);

    const formattedData = (monthlyData.rows as any[]).map((row) => ({
      month: MONTH_NAMES[row.month - 1],
      monthNumber: row.month,
      collected: Number(row.collected),
      totalBilled: Number(row.total_billed),
      pendingCount: Number(row.pending_count),
      paidCount: Number(row.paid_count),
      collectionRate:
        Number(row.total_billed) > 0
          ? (Number(row.collected) / Number(row.total_billed)) * 100
          : 0,
    }));

    res.json({
      success: true,
      data: {
        year: targetYear,
        monthlyTrends: formattedData,
      },
    });
  } catch (error) {
    console.error("MONTHLY_TRENDS[GET]:", error);
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
    const { year, month } = req.query;

    let yearCondition = sql``;
    let monthCondition = sql``;

    if (year) {
      yearCondition = sql`AND b.year = ${parseInt(year as string)}`;
    }
    if (month) {
      monthCondition = sql`AND b.month = ${parseInt(month as string)}`;
    }

    const paymentMethodsData = await db.execute(sql`
      SELECT 
        p.payment_via,
        COALESCE(SUM(p.amount), 0) as total_amount,
        COUNT(p.payment_id) as transaction_count
      FROM ${paymentsTable} p
      JOIN ${billsTable} b ON b.bill_id = p.bill_id
      WHERE EXISTS (
        SELECT 1 FROM ${flatsTable} f
        WHERE f.society_id = ${societyId}
      )
      ${yearCondition}
      ${monthCondition}
      GROUP BY p.payment_via
    `);

    const formattedData = (paymentMethodsData.rows as any[]).map((row) => ({
      method: row.payment_via?.toUpperCase() || "UNKNOWN",
      amount: Number(row.total_amount),
      count: Number(row.transaction_count),
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
          year: year ? parseInt(year as string) : "all",
          month: month ? parseInt(month as string) : "all",
        },
        distribution: dataWithPercentage,
        totalAmount,
      },
    });
  } catch (error) {
    console.error("PAYMENT_METHODS[GET]:", error);
    res.status(500).json({
      error: "Failed to fetch payment method distribution",
      success: false,
    });
  }
}

async function getRevenueVsOutstandingHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    const { year } = req.query;

    const targetYear = year
      ? parseInt(year as string)
      : new Date().getFullYear();

    const monthlyComparison = await db.execute(sql`
      SELECT 
        b.month,
        COALESCE(SUM(CASE WHEN b.status = 'paid' THEN s.charges ELSE 0 END), 0) as revenue,
        COALESCE(SUM(CASE WHEN b.status = 'pending' THEN s.charges ELSE 0 END), 0) as outstanding,
        COALESCE(SUM(s.charges), 0) as total_billed
      FROM ${billsTable} b
      JOIN ${subscriptionsTable} s ON s.subscription_id = b.subscription_id
      WHERE b.year = ${targetYear}
        AND EXISTS (
          SELECT 1 FROM ${flatsTable} f
          WHERE f.society_id = ${societyId}
        )
      GROUP BY b.month
      ORDER BY b.month ASC
    `);

    const formattedData = (monthlyComparison.rows as any[]).map((row) => ({
      month: MONTH_NAMES[row.month - 1],
      monthNumber: row.month,
      revenue: Number(row.revenue),
      outstanding: Number(row.outstanding),
      totalBilled: Number(row.total_billed),
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
        year: targetYear,
        monthlyData: formattedData,
        yearlySummary: yearlyTotal,
      },
    });
  } catch (error) {
    console.error("REVENUE_OUTSTANDING[GET]:", error);
    res.status(500).json({
      error: "Failed to fetch revenue vs outstanding data",
      success: false,
    });
  }
}

async function getCompleteDashboardDataHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    const { year, month } = req.query;

    const targetYear = year
      ? parseInt(year as string)
      : new Date().getFullYear();

    const [
      overviewResult,
      monthlyTrendsResult,
      paymentMethodsResult,
      topPendingResult,
    ] = await Promise.allSettled([
      db.execute(sql`
        SELECT 
          COALESCE(SUM(CASE WHEN b.status = 'paid' THEN s.charges ELSE 0 END), 0) as total_collected,
          COALESCE(SUM(CASE WHEN b.status = 'pending' THEN s.charges ELSE 0 END), 0) as total_pending,
          COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_bills_count,
          COUNT(CASE WHEN b.status = 'paid' THEN 1 END) as paid_bills_count,
          COUNT(DISTINCT b.flat_recipient_id) as total_flats_with_bills
        FROM ${billsTable} b
        JOIN ${subscriptionsTable} s ON s.subscription_id = b.subscription_id
        WHERE b.year = ${targetYear}
      `),

      db.execute(sql`
        SELECT 
          b.month,
          COALESCE(SUM(CASE WHEN b.status = 'paid' THEN s.charges ELSE 0 END), 0) as collected,
          COALESCE(SUM(s.charges), 0) as total_billed
        FROM ${billsTable} b
        JOIN ${subscriptionsTable} s ON s.subscription_id = b.subscription_id
        WHERE b.year = ${targetYear}
        GROUP BY b.month
        ORDER BY b.month ASC
      `),

      db.execute(sql`
        SELECT 
          p.payment_via,
          COALESCE(SUM(p.amount), 0) as total_amount
        FROM ${paymentsTable} p
        JOIN ${billsTable} b ON b.bill_id = p.bill_id
        WHERE b.year = ${targetYear}
        GROUP BY p.payment_via
      `),

      db.execute(sql`
        SELECT 
          concat(f.flat_number, ', ', f.flat_floor, ', ', f.flat_block) as flat_address,
          COALESCE(SUM(s.charges), 0) as total_pending_amount
        FROM ${billsTable} b
        JOIN ${subscriptionsTable} s ON s.subscription_id = b.subscription_id
        JOIN ${flatsTable} f ON EXISTS (
          SELECT 1 FROM flat_recipients fr 
          WHERE fr.flat_recipient_id = b.flat_recipient_id 
          AND fr.flat_id = f.flat_id
        )
        WHERE b.status = 'pending' AND b.year = ${targetYear}
        GROUP BY f.flat_id, f.flat_number, f.flat_floor, f.flat_block
        ORDER BY total_pending_amount DESC
        LIMIT 5
      `),
    ]);

    const overview =
      overviewResult.status === "fulfilled"
        ? overviewResult.value.rows[0]
        : null;
    const monthlyTrends =
      monthlyTrendsResult.status === "fulfilled"
        ? monthlyTrendsResult.value.rows
        : [];
    const paymentMethods =
      paymentMethodsResult.status === "fulfilled"
        ? paymentMethodsResult.value.rows
        : [];
    const topPendingFlats =
      topPendingResult.status === "fulfilled"
        ? topPendingResult.value.rows
        : [];

    const totalCollected = Number((overview as any)?.total_collected || 0);
    const totalPending = Number((overview as any)?.total_pending || 0);
    const collectionRate =
      totalCollected + totalPending > 0
        ? (totalCollected / (totalCollected + totalPending)) * 100
        : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalCollected,
          totalPending,
          pendingBillsCount: Number(
            (overview as any)?.pending_bills_count || 0,
          ),
          paidBillsCount: Number((overview as any)?.paid_bills_count || 0),
          totalFlatsWithBills: Number(
            (overview as any)?.total_flats_with_bills || 0,
          ),
          collectionRate: Math.round(collectionRate * 100) / 100,
        },
        monthlyTrends: (monthlyTrends as any[]).map((row) => ({
          month: MONTH_NAMES[row.month - 1],
          collected: Number(row.collected),
          totalBilled: Number(row.total_billed),
        })),
        paymentMethods: (paymentMethods as any[]).map((row) => ({
          method: row.payment_via?.toUpperCase() || "UNKNOWN",
          amount: Number(row.total_amount),
        })),
        topPendingFlats: (topPendingFlats as any[]).map((row) => ({
          flat: row.flat_address,
          amount: Number(row.total_pending_amount),
        })),
      },
    });
  } catch (error) {
    console.error("COMPLETE_DASHBOARD[GET]:", error);
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
