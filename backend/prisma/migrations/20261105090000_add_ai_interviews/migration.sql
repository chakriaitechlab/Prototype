-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('INVITED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InterviewLanguage" AS ENUM ('ENGLISH', 'BANGLA');

-- CreateEnum
CREATE TYPE "InterviewPhase" AS ENUM ('INTRO', 'SKILL');

-- CreateEnum
CREATE TYPE "InterviewReportStatus" AS ENUM ('PENDING', 'READY', 'FAILED');

-- AlterEnum
ALTER TYPE "MessageKind" ADD VALUE 'INTERVIEW_COMPLETED';

-- CreateTable
CREATE TABLE "ai_interviews" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "opportunity_id" TEXT NOT NULL,
    "seeker_id" TEXT NOT NULL,
    "status" "InterviewStatus" NOT NULL DEFAULT 'INVITED',
    "language" "InterviewLanguage" NOT NULL DEFAULT 'ENGLISH',
    "skills" TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'Medium',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "warnings" INTEGER NOT NULL DEFAULT 0,
    "end_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_interview_turns" (
    "id" TEXT NOT NULL,
    "interview_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "phase" "InterviewPhase" NOT NULL,
    "skill" TEXT,
    "question_type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "answered_at" TIMESTAMP(3),
    "marks" INTEGER,
    "verdict" TEXT,
    "feedback" TEXT,
    "ideal_answer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_interview_turns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_interview_reports" (
    "id" TEXT NOT NULL,
    "interview_id" TEXT NOT NULL,
    "status" "InterviewReportStatus" NOT NULL DEFAULT 'PENDING',
    "overall_score" DOUBLE PRECISION,
    "verdict" TEXT,
    "summary" TEXT,
    "skill_scores" JSONB NOT NULL DEFAULT '[]',
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_interview_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_interviews_application_id_key" ON "ai_interviews"("application_id");

-- CreateIndex
CREATE INDEX "ai_interviews_seeker_id_created_at_idx" ON "ai_interviews"("seeker_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ai_interviews_opportunity_id_idx" ON "ai_interviews"("opportunity_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_interview_turns_interview_id_position_key" ON "ai_interview_turns"("interview_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ai_interview_reports_interview_id_key" ON "ai_interview_reports"("interview_id");

-- AddForeignKey
ALTER TABLE "ai_interviews" ADD CONSTRAINT "ai_interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "opportunity_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interviews" ADD CONSTRAINT "ai_interviews_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interviews" ADD CONSTRAINT "ai_interviews_seeker_id_fkey" FOREIGN KEY ("seeker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interview_turns" ADD CONSTRAINT "ai_interview_turns_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "ai_interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interview_reports" ADD CONSTRAINT "ai_interview_reports_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "ai_interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill
INSERT INTO "ai_interviews" ("id", "application_id", "opportunity_id", "seeker_id", "skills", "difficulty", "expires_at", "created_at", "updated_at")
SELECT gen_random_uuid()::text, a."id", a."opportunity_id", a."seeker_id", o."skills", o."interview_difficulty", a."interview_expires_at", COALESCE(a."decided_at", CURRENT_TIMESTAMP), CURRENT_TIMESTAMP
FROM "opportunity_applications" a
JOIN "opportunities" o ON o."id" = a."opportunity_id"
WHERE a."status" = 'VOICE_INTERVIEW' AND a."interview_expires_at" IS NOT NULL;

-- AlterTable
ALTER TABLE "opportunity_applications" DROP COLUMN "interview_expires_at";
