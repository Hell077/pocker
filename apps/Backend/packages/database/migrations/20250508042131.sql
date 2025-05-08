-- Modify "account_balances" table
ALTER TABLE "public"."account_balances" DROP CONSTRAINT "fk_account_balances_user", ADD CONSTRAINT "fk_accounts_account_balance" FOREIGN KEY ("user_id") REFERENCES "public"."accounts" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
