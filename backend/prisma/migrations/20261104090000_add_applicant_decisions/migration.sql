-- CreateEnum
CREATE TYPE "MessageKind" AS ENUM ('TEXT', 'INTERVIEW_INVITE', 'APPLICATION_REJECTED');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN "kind" "MessageKind" NOT NULL DEFAULT 'TEXT',
ADD COLUMN "metadata" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "opportunity_applications" ADD COLUMN "interview_expires_at" TIMESTAMP(3),
ADD COLUMN "decided_at" TIMESTAMP(3);
