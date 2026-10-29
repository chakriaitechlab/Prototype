-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('JOB', 'TASK', 'PROJECT');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'CV_SCREENING', 'VOICE_INTERVIEW', 'INTERVIEW_SUBMITTED', 'RECRUITER_REVIEW', 'ASSIGNED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MatchScoreStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "seeker_profiles" ADD COLUMN     "certifications" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "education" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "experience" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "languages" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "location" TEXT,
ADD COLUMN     "portfolio_links" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "projects" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "skills" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "social_links" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "company_id" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "location" TEXT,
    "type" "OpportunityType" NOT NULL DEFAULT 'JOB',
    "description" TEXT,
    "skills" TEXT[],
    "employment_type" TEXT,
    "salary" TEXT,
    "experience" TEXT,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'ACTIVE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunity_applications" (
    "id" TEXT NOT NULL,
    "opportunity_id" TEXT NOT NULL,
    "seeker_id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "match_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunity_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_score_cache" (
    "id" TEXT NOT NULL,
    "seeker_id" TEXT NOT NULL,
    "opportunity_id" TEXT NOT NULL,
    "match_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "explanation" JSONB,
    "status" "MatchScoreStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_score_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "opportunities_owner_id_status_created_at_idx" ON "opportunities"("owner_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "opportunities_status_type_created_at_idx" ON "opportunities"("status", "type", "created_at" DESC);

-- CreateIndex
CREATE INDEX "opportunity_applications_seeker_id_applied_at_idx" ON "opportunity_applications"("seeker_id", "applied_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "opportunity_applications_opportunity_id_seeker_id_key" ON "opportunity_applications"("opportunity_id", "seeker_id");

-- CreateIndex
CREATE INDEX "match_score_cache_opportunity_id_status_idx" ON "match_score_cache"("opportunity_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "match_score_cache_seeker_id_opportunity_id_key" ON "match_score_cache"("seeker_id", "opportunity_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_created_at_idx" ON "notifications"("user_id", "read", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_applications" ADD CONSTRAINT "opportunity_applications_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_applications" ADD CONSTRAINT "opportunity_applications_seeker_id_fkey" FOREIGN KEY ("seeker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_score_cache" ADD CONSTRAINT "match_score_cache_seeker_id_fkey" FOREIGN KEY ("seeker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_score_cache" ADD CONSTRAINT "match_score_cache_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

