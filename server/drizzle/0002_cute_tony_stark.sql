ALTER TABLE "flat_types" DROP CONSTRAINT "flat_types_size_unique";--> statement-breakpoint
ALTER TABLE "flat_types" ADD COLUMN "society_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "flat_types" ADD CONSTRAINT "flat_types_society_id_societies_society_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("society_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flat_types" ADD CONSTRAINT "flat_types_size_society_id_unique" UNIQUE("size","society_id");