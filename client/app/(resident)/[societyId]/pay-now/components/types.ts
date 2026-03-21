import z from "zod";

export type PendingBillResultType = {
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

export const userPaymentSchema = z.object({
  billId: z.string({
    error: "Please select a bill",
  }),
  amount: z.string().min(1, "Amount is required"),
  paymentVia: z.enum(["cash", "upi", "card"], {
    error: "Please select a payment method",
  }),
});

export type UserPaymentFormData = z.infer<typeof userPaymentSchema>;
