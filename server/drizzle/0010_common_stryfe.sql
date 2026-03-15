ALTER TABLE "payments" ALTER COLUMN "paid_at" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "paid_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;