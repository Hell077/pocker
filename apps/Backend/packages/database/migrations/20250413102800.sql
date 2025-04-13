-- Create "account_balances" table
CREATE TABLE "public"."account_balances" (
  "id" text NOT NULL,
  "user_id" text NOT NULL,
  "current_balance" text NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_account_balances_user" FOREIGN KEY ("user_id") REFERENCES "public"."accounts" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
