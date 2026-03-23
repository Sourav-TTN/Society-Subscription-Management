CREATE TABLE "firebase_tokens" (
	"token_id" text PRIMARY KEY NOT NULL,
	"society_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "firebase_tokens_token_id_unique" UNIQUE("token_id")
);
--> statement-breakpoint
ALTER TABLE "firebase_tokens" ADD CONSTRAINT "firebase_tokens_society_id_societies_society_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("society_id") ON DELETE no action ON UPDATE no action;