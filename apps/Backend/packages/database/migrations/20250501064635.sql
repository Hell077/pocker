-- Modify "rewards" table
ALTER TABLE "public"."rewards" ALTER COLUMN "user_id" SET NOT NULL, ALTER COLUMN "claimed_at" TYPE timestamptz, ALTER COLUMN "next" TYPE timestamptz, ADD COLUMN "reward_date" timestamptz NULL, ADD COLUMN "amount" bigint NOT NULL;
-- Create index "idx_rewards_user_id" to table: "rewards"
CREATE INDEX "idx_rewards_user_id" ON "public"."rewards" ("user_id");
-- Modify "reward_statistics" table
ALTER TABLE "public"."reward_statistics" ALTER COLUMN "user_id" SET NOT NULL, DROP COLUMN "reward", DROP COLUMN "claimed_count", ADD COLUMN "reward_id" text NOT NULL, ADD CONSTRAINT "fk_reward_statistics_reward" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- Create index "idx_reward_statistics_user_id" to table: "reward_statistics"
CREATE INDEX "idx_reward_statistics_user_id" ON "public"."reward_statistics" ("user_id");
