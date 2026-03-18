ALTER TABLE "notification_recipients" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "updated_at" SET DEFAULT now();