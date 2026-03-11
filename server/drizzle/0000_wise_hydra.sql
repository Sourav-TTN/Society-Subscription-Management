CREATE TABLE "admins" (
	"admin_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"society_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"bill_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flat_recipient_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"subscription_id" uuid NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flat_recipients" (
	"flat_recipient_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flat_id" uuid NOT NULL,
	"owner_id" uuid,
	"is_current_owner" boolean DEFAULT true NOT NULL,
	"from" date NOT NULL,
	"to" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flat_types" (
	"flat_type_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "flat_types_size_unique" UNIQUE("size")
);
--> statement-breakpoint
CREATE TABLE "flats" (
	"flat_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flat_block" text NOT NULL,
	"flat_floor" integer NOT NULL,
	"flat_number" text NOT NULL,
	"society_id" uuid NOT NULL,
	"flat_type_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_recipients" (
	"notification_recipient_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"flat_recipient_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"notification_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"sent_by" uuid NOT NULL,
	"content" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"payment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bill_id" uuid NOT NULL,
	"amount" numeric NOT NULL,
	"payment_via" text NOT NULL,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "societies" (
	"society_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"pin" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"subscription_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flat_type_id" uuid NOT NULL,
	"charges" numeric NOT NULL,
	"created_by" uuid NOT NULL,
	"effective_from" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"is_verified" boolean DEFAULT true NOT NULL,
	"otp" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_society_id_societies_society_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("society_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_flat_recipient_id_flat_recipients_flat_recipient_id_fk" FOREIGN KEY ("flat_recipient_id") REFERENCES "public"."flat_recipients"("flat_recipient_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_subscription_id_subscriptions_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("subscription_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flat_recipients" ADD CONSTRAINT "flat_recipients_flat_id_flats_flat_id_fk" FOREIGN KEY ("flat_id") REFERENCES "public"."flats"("flat_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flat_recipients" ADD CONSTRAINT "flat_recipients_owner_id_users_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flats" ADD CONSTRAINT "flats_society_id_societies_society_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("society_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flats" ADD CONSTRAINT "flats_flat_type_id_flat_types_flat_type_id_fk" FOREIGN KEY ("flat_type_id") REFERENCES "public"."flat_types"("flat_type_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flats" ADD CONSTRAINT "flats_created_by_admins_admin_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("admin_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipients" ADD CONSTRAINT "notification_recipients_notification_id_notifications_notification_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("notification_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipients" ADD CONSTRAINT "notification_recipients_flat_recipient_id_flat_recipients_flat_recipient_id_fk" FOREIGN KEY ("flat_recipient_id") REFERENCES "public"."flat_recipients"("flat_recipient_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sent_by_admins_admin_id_fk" FOREIGN KEY ("sent_by") REFERENCES "public"."admins"("admin_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bill_id_bills_bill_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("bill_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_flat_type_id_flat_types_flat_type_id_fk" FOREIGN KEY ("flat_type_id") REFERENCES "public"."flat_types"("flat_type_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_created_by_admins_admin_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("admin_id") ON DELETE no action ON UPDATE no action;