-- AlterTable
ALTER TABLE "seeker_profiles" ADD COLUMN     "achievements" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "availability" TEXT NOT NULL DEFAULT 'open',
ADD COLUMN     "job_preferences" JSONB NOT NULL DEFAULT '{}';
