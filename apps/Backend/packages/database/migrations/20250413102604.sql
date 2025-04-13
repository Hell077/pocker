-- Create "accounts" table
CREATE TABLE "public"."accounts" (
  "id" text NOT NULL,
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  "deleted_at" timestamptz NULL,
  "password" text NULL,
  "email" text NULL,
  "avatar_link" text NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "uni_accounts_email" UNIQUE ("email")
);
-- Create index "idx_accounts_deleted_at" to table: "accounts"
CREATE INDEX "idx_accounts_deleted_at" ON "public"."accounts" ("deleted_at");
