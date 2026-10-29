-- DropIndex
DROP INDEX IF EXISTS "recruiter_favorites_recruiter_id_target_type_createdAt_idx";

-- DropColumn
ALTER TABLE "recruiter_favorites" DROP COLUMN IF EXISTS "target_type";

-- CreateIndex
CREATE INDEX "recruiter_favorites_recruiter_id_createdAt_idx" ON "recruiter_favorites"("recruiter_id", "createdAt" DESC);
