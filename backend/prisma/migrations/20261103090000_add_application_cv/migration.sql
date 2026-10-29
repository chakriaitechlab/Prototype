-- AlterTable
ALTER TABLE "opportunity_applications" ADD COLUMN "ref_no" TEXT,
ADD COLUMN "apply_method" TEXT NOT NULL DEFAULT 'profile',
ADD COLUMN "cv_url" TEXT,
ADD COLUMN "cv_file_name" TEXT,
ADD COLUMN "cv_snapshot" JSONB NOT NULL DEFAULT '{}';

-- Backfill
UPDATE "opportunity_applications" SET "ref_no" = 'CHK-' || UPPER(SUBSTRING(REPLACE("id", '-', '') FROM 1 FOR 10)) WHERE "ref_no" IS NULL;

-- AlterTable
ALTER TABLE "opportunity_applications" ALTER COLUMN "ref_no" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "opportunity_applications_ref_no_key" ON "opportunity_applications"("ref_no");
