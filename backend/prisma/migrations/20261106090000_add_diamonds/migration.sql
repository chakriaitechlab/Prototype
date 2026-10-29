-- CreateEnum
CREATE TYPE "DiamondAction" AS ENUM ('SIGNUP_BONUS', 'MONTHLY_REFILL', 'PLAN_PURCHASE');

-- CreateTable
CREATE TABLE "diamond_wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "plan_id" TEXT NOT NULL DEFAULT 'free',
    "plan_expires_at" TIMESTAMP(3),
    "refill_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diamond_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diamond_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" "DiamondAction" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "plan_id" TEXT NOT NULL,
    "ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diamond_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "diamond_wallets_user_id_key" ON "diamond_wallets"("user_id");

-- CreateIndex
CREATE INDEX "diamond_transactions_user_id_created_at_idx" ON "diamond_transactions"("user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "diamond_transactions_action_ref_key" ON "diamond_transactions"("action", "ref");

-- AddForeignKey
ALTER TABLE "diamond_wallets" ADD CONSTRAINT "diamond_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diamond_transactions" ADD CONSTRAINT "diamond_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
