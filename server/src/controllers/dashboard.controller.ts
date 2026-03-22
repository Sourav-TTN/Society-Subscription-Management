import {
  billsTable,
  flatsTable,
  paymentsTable,
  subscriptionsTable,
} from "../db/schema.js";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
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

export {
  getRevenueVsOutstandingHandler,
  getCompleteDashboardDataHandler,
  getMonthlyCollectionTrendsHandler,
  getPaymentMethodDistributionHandler,
};
