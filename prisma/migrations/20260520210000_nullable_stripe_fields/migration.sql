-- AlterTable: make Stripe fields nullable to support manually-imported members
ALTER TABLE "subscriptions" ALTER COLUMN "stripe_subscription_id" DROP NOT NULL;
ALTER TABLE "subscriptions" ALTER COLUMN "stripe_price_id" DROP NOT NULL;
ALTER TABLE "subscriptions" ALTER COLUMN "stripe_customer_id" DROP NOT NULL;
