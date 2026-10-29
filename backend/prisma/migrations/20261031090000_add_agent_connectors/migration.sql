-- AlterEnum
ALTER TYPE "AgentStepKind" ADD VALUE 'GMAIL' BEFORE 'ERROR';

-- CreateEnum
CREATE TYPE "AgentConnectorProvider" AS ENUM ('GMAIL');

-- CreateTable
CREATE TABLE "agent_connectors" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "AgentConnectorProvider" NOT NULL,
    "email" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_connectors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_connectors_user_id_provider_key" ON "agent_connectors"("user_id", "provider");

-- AddForeignKey
ALTER TABLE "agent_connectors" ADD CONSTRAINT "agent_connectors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
