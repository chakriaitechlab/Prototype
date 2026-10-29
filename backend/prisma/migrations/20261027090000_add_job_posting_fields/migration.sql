-- AlterTable
ALTER TABLE "opportunities" ADD COLUMN     "apply_methods" TEXT[],
ADD COLUMN     "auto_pilot_mode" TEXT NOT NULL DEFAULT 'threshold',
ADD COLUMN     "benefits" TEXT[],
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "deadline" DATE,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "interview_difficulty" TEXT NOT NULL DEFAULT 'Medium',
ADD COLUMN     "interview_threshold" INTEGER NOT NULL DEFAULT 65,
ADD COLUMN     "is_remote" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "job_level" TEXT,
ADD COLUMN     "salary_currency" TEXT,
ADD COLUMN     "salary_max" INTEGER,
ADD COLUMN     "salary_min" INTEGER,
ADD COLUMN     "salary_mode" TEXT,
ADD COLUMN     "salary_type" TEXT,
ADD COLUMN     "vacancies" INTEGER NOT NULL DEFAULT 1;

