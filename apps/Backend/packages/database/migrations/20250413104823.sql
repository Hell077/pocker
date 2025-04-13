-- Modify "accounts" table
ALTER TABLE "public"."accounts" DROP COLUMN "created_at", DROP COLUMN "updated_at", DROP COLUMN "deleted_at";
-- Create "rooms" table
CREATE TABLE "public"."rooms" (
  "id" bigserial NOT NULL,
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  "deleted_at" timestamptz NULL,
  "room_id" text NOT NULL,
  PRIMARY KEY ("id")
);
-- Create index "idx_rooms_deleted_at" to table: "rooms"
CREATE INDEX "idx_rooms_deleted_at" ON "public"."rooms" ("deleted_at");
-- Create index "idx_rooms_room_id" to table: "rooms"
CREATE UNIQUE INDEX "idx_rooms_room_id" ON "public"."rooms" ("room_id");
-- Create "room_users" table
CREATE TABLE "public"."room_users" (
  "room_id" bigint NOT NULL,
  "account_id" text NOT NULL,
  PRIMARY KEY ("room_id", "account_id"),
  CONSTRAINT "fk_room_users_account" FOREIGN KEY ("account_id") REFERENCES "public"."accounts" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_room_users_room" FOREIGN KEY ("room_id") REFERENCES "public"."rooms" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
