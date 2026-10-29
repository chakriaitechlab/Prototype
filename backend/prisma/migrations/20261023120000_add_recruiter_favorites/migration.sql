-- CreateTable
CREATE TABLE "recruiter_favorites" (
    "id" TEXT NOT NULL,
    "recruiter_id" TEXT NOT NULL,
    "target_key" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recruiter_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recruiter_favorites_recruiter_id_target_type_createdAt_idx" ON "recruiter_favorites"("recruiter_id", "target_type", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "recruiter_favorites_recruiter_id_target_key_key" ON "recruiter_favorites"("recruiter_id", "target_key");

-- AddForeignKey
ALTER TABLE "recruiter_favorites" ADD CONSTRAINT "recruiter_favorites_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
