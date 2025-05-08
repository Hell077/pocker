-- Create "reward_statistics" table
CREATE TABLE "public"."reward_statistics" (
  "id" text NOT NULL,
  "user_id" text NULL,
  "reward" text NULL,
  "counts" bigint NULL,
  "claimed_count" bigint NULL,
  PRIMARY KEY ("id")
);
-- Create "rewards" table
CREATE TABLE "public"."rewards" (
  "id" text NOT NULL,
  "user_id" text NULL,
  "claimed_at" timestamp NULL,
  "next" timestamp NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_rewards_account" FOREIGN KEY ("user_id") REFERENCES "public"."accounts" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Drop "game_logs" table
DROP TABLE "public"."game_logs";
-- Drop "notifications" table
DROP TABLE "public"."notifications";
-- Drop "replays" table
DROP TABLE "public"."replays";
-- Drop "tournament_players" table
DROP TABLE "public"."tournament_players";
-- Drop "tournaments" table
DROP TABLE "public"."tournaments";
