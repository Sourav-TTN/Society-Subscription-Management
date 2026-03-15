ALTER TABLE "flat_types" DROP CONSTRAINT "flat_types_size_society_id_unique";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_flat_type_id_effective_from_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_society_id_unique";--> statement-breakpoint
ALTER TABLE "bills" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "unique_bill_subscription_month_year" UNIQUE("subscription_id","flat_recipient_id","month","year");--> statement-breakpoint
ALTER TABLE "flat_types" ADD CONSTRAINT "unique_flat_types_size_society" UNIQUE("size","society_id");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "unique_subscriptions_flat_type_effective_from" UNIQUE("flat_type_id","effective_from");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "unique_users_email_society" UNIQUE("email","society_id");