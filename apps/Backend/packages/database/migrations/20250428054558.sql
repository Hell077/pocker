-- Create "current_day_rewards" table
CREATE TABLE "public"."current_day_rewards" (
  "id" text NOT NULL,
  "date" timestamptz NOT NULL,
  PRIMARY KEY ("id")
);
-- Create "current_day_reward_items" table
CREATE TABLE "public"."current_day_reward_items" (
  "id" text NOT NULL,
  "current_day_reward_id" text NOT NULL,
  "reward" bigint NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_current_day_rewards_items" FOREIGN KEY ("current_day_reward_id") REFERENCES "public"."current_day_rewards" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create index "idx_current_day_reward_items_current_day_reward_id" to table: "current_day_reward_items"
CREATE INDEX "idx_current_day_reward_items_current_day_reward_id" ON "public"."current_day_reward_items" ("current_day_reward_id");
