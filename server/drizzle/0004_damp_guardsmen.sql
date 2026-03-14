ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "flat_recipients" ALTER COLUMN "owner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "flat_recipients" ALTER COLUMN "from" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "society_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_society_id_societies_society_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("society_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_society_id_unique" UNIQUE("email","society_id");