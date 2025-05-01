-- Drop index "idx_rewards_user_id" from table: "rewards"
DROP INDEX "public"."idx_rewards_user_id";
-- Modify "rewards" table
ALTER TABLE "public"."rewards" DROP CONSTRAINT "fk_rewards_account", DROP COLUMN "next", ALTER COLUMN "reward_date" SET NOT NULL, ADD CONSTRAINT "fk_rewards_user" FOREIGN KEY ("user_id") REFERENCES "public"."accounts" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- Create index "uniq_user_reward_date" to table: "rewards"
CREATE UNIQUE INDEX "uniq_user_reward_date" ON "public"."rewards" ("user_id", "reward_date");
