import z from "zod";

export type PendingBillType = {
  billId: string;
  flatRecipientId: string;
  ownerName: string;
  ownerEmail: string;
  flat: string;
  month: number;
  year: number;
  subscriptionId: string;
  charges: string;
  status: "pending" | "paid";
  createdAt: Date;
  updatedAt: Date;
};

export const paymentSchema = z.object({
  billId: z.string({
    error: "Please select a bill",
  }),
  amount: z.string().min(1, "Amount is required"),
  paymentVia: z.enum(["cash", "upi"], {
    error: "Please select a payment method",
  }),
  paidAt: z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
