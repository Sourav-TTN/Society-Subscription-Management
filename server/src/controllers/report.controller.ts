import { z } from "zod";
import axios from "axios";
import { jsPDF } from "jspdf";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { autoTable } from "jspdf-autotable";
import type { Request, Response } from "express";
import {
  flatsTable,
  usersTable,
  billsTable,
  paymentsTable,
  subscriptionsTable,
  flatRecipientsTable,
} from "../db/schema.js";

type BillReportType = {
  billId: string;
  flatRecipientId: string;
  createdAt: Date;
  updatedAt: Date;
  status: "pending" | "paid";
  subscriptionId: string;
  month: number;
  year: number;
  flat: string;
  flatId: number;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  isCurrentOwner: boolean;
  from: Date;
  amount: number;
  paymentId: string | null;
  paymentVia: "cash" | "upi" | "online" | null;
};

type ReportsApiResponseType = {
  message: string;
  bills: BillReportType[];
  totalPending: number;
  totalCollected: number;
  pendingCustomers: number;
  totalCashPayments: number;
  totalUpiPayments: number;
  pendingPayments: BillReportType[];
  totalOnlinePayments: number;
  success: boolean;
};

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

async function getReportsDataHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    console.log(`Request received at /api/society/${societyId}/reports`);

    const filterValidation = z
      .object({
        month: z.number().int().min(1).max(12).optional(),
        year: z.number().int().min(1000).max(9999).optional(),
      })
      .safeParse(req.query);

    if (filterValidation.error) {
      return res.status(400).json({
        error: filterValidation.error.message,
        success: false,
      });
    }

    const currentYear = new Date().getFullYear();

    const { month, year = currentYear } = filterValidation.data;

    const billsResult = await db.execute<BillReportType>(sql`
        select 
          b.bill_id as "billId",
          b.subscription_id as "subscriptionId",
          b.flat_recipient_id as "flatRecipientId",
          concat(f.flat_number, ', ', f.flat_floor, ', ', f.flat_block) as "flat",
          fr.flat_id as "flatId",
          fr.owner_id as "ownerId",
          p.payment_id as "paymentId",
          p.payment_via as "paymentVia",
          u.name as "ownerName",
          u.email as "ownerEmail",
          fr.is_current_owner as "isCurrentOwner",
          fr.from as "from",
          s.charges as "amount",
          b.status as "status",
          b.month as "month",
          b.year as "year",
          b.created_at as "createdAt",
          b.updated_at as "updatedAt"
        from ${billsTable} b
        join ${subscriptionsTable} s on s.subscription_id = b.subscription_id
        join ${flatRecipientsTable} fr on fr.flat_recipient_id = b.flat_recipient_id
        join ${flatsTable} f on f.flat_id = fr.flat_id
        join ${usersTable} u on u.user_id = fr.owner_id
        left join ${paymentsTable} p on p.bill_id = b.bill_id
        where f.society_id = ${societyId} and b.year = ${year}
        ${month ? sql`and b.month = ${month}` : sql``}
    `);

    const bills = billsResult.rows;

    const pendingPayments = bills.filter((bill) => bill.status === "pending");

    const totalPending = bills.reduce((sum, bill) => {
      if (bill.status == "pending") {
        return sum + Number(bill.amount);
      }
      return sum;
    }, 0);

    const totalCollected = bills.reduce((sum, bill) => {
      if (bill.status == "paid") {
        return sum + Number(bill.amount);
      }
      return sum;
    }, 0);

    const pendingCustomers = bills.filter(
      (bill) => bill.status == "pending",
    ).length;

    const totalCashPayments = bills.reduce((sum, bill) => {
      if (bill.paymentVia === "cash") {
        return sum + Number(bill.amount);
      }
      return sum;
    }, 0);

    const totalUpiPayments = bills.reduce((sum, bill) => {
      if (bill.paymentVia === "upi") {
        return sum + Number(bill.amount);
      }
      return sum;
    }, 0);

    const totalOnlinePayments = bills.reduce((sum, bill) => {
      if (bill.paymentVia === "online") {
        return sum + Number(bill.amount);
      }
      return sum;
    }, 0);

    res.json({
      message: "Reports data fetched successfully",
      bills,
      totalPending,
      totalCollected,
      pendingCustomers,
      totalCashPayments,
      totalUpiPayments,
      pendingPayments,
      totalOnlinePayments,
      success: true,
    });
  } catch (error) {
    console.error("REPORTS[GET]:", error);
    res.status(500).json({
      error: "Something went wrong",
      success: false,
    });
  }
}

async function reportGenerationHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    console.log(
      `Request received at /api/society/${societyId}/reports/generate-report`,
    );

    const currentYear = new Date().getFullYear();
    const { month, year } = req.query;

    let url = `${process.env.SERVER_URL}/api/society/${societyId}/reports`;
    const params = new URLSearchParams();
    if (month) params.append("month", month.toString());
    if (year) params.append("year", year.toString());
    if (params.toString()) url += `?${params.toString()}`;

    const getReportData = await axios.get<ReportsApiResponseType>(url);

    if (!getReportData.data.success) {
      return res.status(400).json({
        error: "Failed to fetch report data",
        success: false,
      });
    }

    const doc = await reportPdfCreator(
      getReportData.data,
      month ? parseInt(month as string) : undefined,
      year ? parseInt(year as string) : undefined,
    );

    const filename = `society-report-${year || new Date().getFullYear()}${month ? `-${month}` : ""}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    return res.status(201).send(pdfBuffer);
  } catch (error) {
    console.error("REPORT GENERATION[POST]:", error);
    res.status(500).json({
      error: "Something went wrong while generating the report",
      success: false,
    });
  }
}

const COLOR = {
  black: [0, 0, 0] as [number, number, number],
  ink: [30, 30, 30] as [number, number, number],
  subtext: [90, 90, 90] as [number, number, number],
  muted: [150, 150, 150] as [number, number, number],
  border: [180, 180, 180] as [number, number, number],
  hairline: [210, 210, 210] as [number, number, number],
  lightBg: [245, 245, 245] as [number, number, number],
  midBg: [220, 220, 220] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
} as const;

const FONT = {
  title: 18,
  h1: 12,
  body: 9,
  small: 7.5,
} as const;

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT = PAGE_W - MARGIN * 2;

function hRule(doc: jsPDF, y: number, weight = 0.3, color = COLOR.hairline) {
  doc.setDrawColor(...color);
  doc.setLineWidth(weight);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
}

function sectionHeading(doc: jsPDF, label: string, y: number): number {
  hRule(doc, y, 0.4, COLOR.border);
  doc.setFontSize(FONT.h1);
  doc.setTextColor(...COLOR.black);
  doc.setFont("helvetica", "bold");
  doc.text(label.toUpperCase(), MARGIN, y + 6.5);
  doc.setFont("helvetica", "normal");
  hRule(doc, y + 9, 0.2);
  return y + 14;
}

function metricCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  label: string,
  value: string,
) {
  const h = 24;

  // Card border
  doc.setDrawColor(...COLOR.border);
  doc.setLineWidth(0.4);
  doc.setFillColor(...COLOR.white);
  doc.rect(x, y, w, h, "FD");

  // Thick top rule - purely typographic, no color
  doc.setDrawColor(...COLOR.black);
  doc.setLineWidth(1.2);
  doc.line(x, y, x + w, y);
  doc.setLineWidth(0.4);

  // Label
  doc.setFontSize(FONT.small);
  doc.setTextColor(...COLOR.subtext);
  doc.setFont("helvetica", "normal");
  doc.text(label.toUpperCase(), x + w / 2, y + 8, { align: "center" });

  // Value
  doc.setFontSize(FONT.h1 + 1);
  doc.setTextColor(...COLOR.black);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + w / 2, y + 18, { align: "center" });
  doc.setFont("helvetica", "normal");
}

function stampFooters(doc: jsPDF, reportTitle: string) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);

    doc.setDrawColor(...COLOR.border);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);

    doc.setFontSize(FONT.small);
    doc.setTextColor(...COLOR.muted);
    doc.setFont("helvetica", "normal");
    doc.text(reportTitle, MARGIN, PAGE_H - 9);
    doc.text("CONFIDENTIAL", PAGE_W / 2, PAGE_H - 9, { align: "center" });
    doc.text(`Page ${i} of ${total}`, PAGE_W - MARGIN, PAGE_H - 9, {
      align: "right",
    });
  }
}

const TABLE_STYLES = {
  theme: "grid" as const,
  styles: {
    fontSize: FONT.body,
    cellPadding: 3,
    textColor: COLOR.ink,
    lineColor: COLOR.border,
    lineWidth: 0.25,
    font: "helvetica",
  },
  headStyles: {
    fillColor: COLOR.black,
    textColor: COLOR.white,
    fontStyle: "bold" as const,
    fontSize: FONT.body,
    cellPadding: 3.5,
  },
  alternateRowStyles: {
    fillColor: COLOR.lightBg,
  },
  footStyles: {
    fillColor: COLOR.midBg,
    textColor: COLOR.black,
    fontStyle: "bold" as const,
    lineColor: COLOR.border,
    lineWidth: 0.3,
  },
};

async function reportPdfCreator(
  data: ReportsApiResponseType,
  month?: number,
  year?: number,
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const reportTitle = month
    ? `Financial Report - ${MONTH_NAMES[month - 1]} ${year}`
    : `Annual Financial Report - ${new Date().getFullYear()}`;

  const generatedAt =
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }) +
    "  ·  " +
    new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  doc.setDrawColor(...COLOR.black);
  doc.setLineWidth(1.5);
  doc.line(MARGIN, 14, PAGE_W - MARGIN, 14);

  doc.setFontSize(8);
  doc.setTextColor(...COLOR.subtext);
  doc.setFont("helvetica", "normal");
  doc.text("SOCIETY MANAGEMENT SYSTEM", MARGIN, 11);
  doc.text(generatedAt, PAGE_W - MARGIN, 11, { align: "right" });

  doc.setFontSize(FONT.title);
  doc.setTextColor(...COLOR.black);
  doc.setFont("helvetica", "bold");
  doc.text(reportTitle, MARGIN, 24);
  doc.setFont("helvetica", "normal");

  hRule(doc, 28, 0.3);

  let curY = 35;
  curY = sectionHeading(doc, "Financial Summary", curY);

  const cardW = (CONTENT - 6) / 2;
  const net = data.totalCollected - data.totalPending;

  metricCard(
    doc,
    MARGIN,
    curY,
    cardW,
    "Total Collected",
    `Rs. ${data.totalCollected.toFixed(2)}`,
  );
  metricCard(
    doc,
    MARGIN + cardW + 6,
    curY,
    cardW,
    "Total Pending",
    `Rs. ${data.totalPending.toFixed(2)}`,
  );
  curY += 30;

  metricCard(
    doc,
    MARGIN,
    curY,
    CONTENT,
    "Net Balance",
    `Rs. ${net.toFixed(2)}`,
  );
  curY += 30;

  curY = sectionHeading(doc, "Payment Method Breakdown", curY);

  const base = data.totalCollected || 1;
  const pct = (v: number) => `${((v / base) * 100).toFixed(1)}%`;

  autoTable(doc, {
    startY: curY,
    head: [["Payment Method", "Amount (Rs.)", "Share"]],
    body: [
      ["Cash", data.totalCashPayments.toFixed(2), pct(data.totalCashPayments)],
      ["UPI", data.totalUpiPayments.toFixed(2), pct(data.totalUpiPayments)],
      [
        "Online",
        data.totalOnlinePayments.toFixed(2),
        pct(data.totalOnlinePayments),
      ],
    ],
    foot: [["Total", data.totalCollected.toFixed(2), "100%"]],
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: "right" },
      2: { halign: "right" },
    },
    margin: { left: MARGIN, right: MARGIN },
    ...TABLE_STYLES,
  });

  if (data.bills && data.bills.length > 0) {
    doc.addPage();

    doc.setDrawColor(...COLOR.black);
    doc.setLineWidth(1.5);
    doc.line(MARGIN, 14, PAGE_W - MARGIN, 14);

    doc.setFontSize(8);
    doc.setTextColor(...COLOR.subtext);
    doc.setFont("helvetica", "normal");
    doc.text("SOCIETY MANAGEMENT SYSTEM", MARGIN, 11);
    doc.text(reportTitle, PAGE_W - MARGIN, 11, { align: "right" });

    doc.setFontSize(FONT.title);
    doc.setTextColor(...COLOR.black);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Bills Report", MARGIN, 24);
    doc.setFont("helvetica", "normal");
    hRule(doc, 28, 0.3);

    const paid = data.bills.filter(
      (b) => b.status.toLowerCase() === "paid",
    ).length;
    const pending = data.bills.length - paid;

    doc.setFontSize(FONT.body);
    doc.setTextColor(...COLOR.subtext);
    doc.text(
      `Total records: ${data.bills.length}   |   Paid: ${paid}   |   Pending: ${pending}`,
      MARGIN,
      35,
    );

    const billsTableData = data.bills.map((bill) => [
      bill.flat,
      bill.ownerName,
      MONTH_NAMES[bill.month - 1] ?? "",
      bill.year.toString(),
      `Rs. ${Number(bill.amount).toFixed(2)}`,
      bill.status.toUpperCase(),
      bill.paymentVia ? bill.paymentVia.toUpperCase() : "-",
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["Flat", "Owner", "Month", "Year", "Amount", "Status", "Via"]],
      body: billsTableData,
      columnStyles: {
        4: { halign: "right" },
        5: { halign: "center", fontStyle: "bold" },
        6: { halign: "center" },
      },
      didParseCell: (hookData) => {
        if (hookData.section === "body" && hookData.column.index === 5) {
          hookData.cell.styles.fontStyle = "bold";
        }
      },
      margin: { left: MARGIN, right: MARGIN },
      ...TABLE_STYLES,
    });
  }

  stampFooters(doc, reportTitle);

  return doc;
}

export { getReportsDataHandler, reportGenerationHandler };
