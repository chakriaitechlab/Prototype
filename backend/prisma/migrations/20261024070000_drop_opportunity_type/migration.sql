-- DropIndex
DROP INDEX "opportunities_status_type_created_at_idx";

-- AlterTable
ALTER TABLE "opportunities" DROP COLUMN "type";

-- DropEnum
DROP TYPE "OpportunityType";

-- CreateIndex
CREATE INDEX "opportunities_status_created_at_idx" ON "opportunities"("status", "created_at" DESC);
