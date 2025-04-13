-- Modify "account_balances" table
ALTER TABLE "public"."account_balances" ADD CONSTRAINT "uni_account_balances_user_id" UNIQUE ("user_id");
-- Modify "accounts" table
ALTER TABLE "public"."accounts" ADD COLUMN "role" text NULL DEFAULT 'user', ADD COLUMN "created_at" bigint NULL, ADD COLUMN "updated_at" bigint NULL;
-- Modify "rooms" table
ALTER TABLE "public"."rooms" ADD COLUMN "max_players" bigint NOT NULL, ADD COLUMN "limits" text NULL, ADD COLUMN "type" text NULL, ADD COLUMN "status" text NULL DEFAULT 'waiting';
-- Create "game_logs" table
CREATE TABLE "public"."game_logs" (
  "id" text NOT NULL,
  "game_id" text NOT NULL,
  "message" text NULL,
  "timestamp" bigint NULL,
  PRIMARY KEY ("id")
);
-- Create "game_moves" table
CREATE TABLE "public"."game_moves" (
  "id" text NOT NULL,
  "game_id" text NOT NULL,
  "player_id" text NOT NULL,
  "action" text NULL,
  "amount" bigint NULL,
  "round_number" bigint NULL,
  "created_at" bigint NULL,
  PRIMARY KEY ("id")
);
-- Create "game_sessions" table
CREATE TABLE "public"."game_sessions" (
  "id" text NOT NULL,
  "room_id" text NOT NULL,
  "round" bigint NULL,
  "pot" bigint NULL,
  "status" text NULL,
  "created_at" bigint NULL,
  PRIMARY KEY ("id")
);
-- Create "replays" table
CREATE TABLE "public"."replays" (
  "id" text NOT NULL,
  "game_id" text NOT NULL,
  "data" text NULL,
  "created_at" bigint NULL,
  PRIMARY KEY ("id")
);
-- Create "tournaments" table
CREATE TABLE "public"."tournaments" (
  "id" text NOT NULL,
  "name" text NULL,
  "type" text NULL,
  "status" text NULL,
  "buy_in" bigint NULL,
  "prize_pool" bigint NULL,
  "max_players" bigint NULL,
  "created_at" bigint NULL,
  PRIMARY KEY ("id")
);
-- Create "game_players" table
CREATE TABLE "public"."game_players" (
  "id" text NOT NULL,
  "game_id" text NOT NULL,
  "user_id" text NOT NULL,
  "seat_number" bigint NULL,
  "chips" bigint NULL,
  "is_folded" boolean NULL,
  "is_all_in" boolean NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_game_players_user" FOREIGN KEY ("user_id") REFERENCES "public"."accounts" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create "notifications" table
CREATE TABLE "public"."notifications" (
  "id" text NOT NULL,
  "user_id" text NOT NULL,
  "title" text NULL,
  "message" text NULL,
  "is_read" boolean NULL,
  "created_at" bigint NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_notifications_user" FOREIGN KEY ("user_id") REFERENCES "public"."accounts" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create "ratings" table
CREATE TABLE "public"."ratings" (
  "id" text NOT NULL,
  "user_id" text NOT NULL,
  "elo" bigint NULL,
  "games" bigint NULL,
  "wins" bigint NULL,
  "win_rate" numeric NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "uni_ratings_user_id" UNIQUE ("user_id"),
  CONSTRAINT "fk_ratings_user" FOREIGN KEY ("user_id") REFERENCES "public"."accounts" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create "tournament_players" table
CREATE TABLE "public"."tournament_players" (
  "id" text NOT NULL,
  "tournament_id" text NOT NULL,
  "user_id" text NOT NULL,
  "is_eliminated" boolean NULL,
  "place" bigint NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_tournament_players_user" FOREIGN KEY ("user_id") REFERENCES "public"."accounts" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
