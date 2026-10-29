-- CreateEnum
CREATE TYPE "AgentSessionStatus" AS ENUM ('RUNNING', 'WAITING_INPUT', 'IDLE', 'STOPPED', 'FAILED');

-- CreateEnum
CREATE TYPE "AgentStepKind" AS ENUM ('USER', 'ASSISTANT', 'SEARCH', 'FETCH', 'NAVIGATE', 'CLICK', 'TYPE', 'SCROLL', 'BACK', 'ASK', 'ERROR');

-- CreateTable
CREATE TABLE "agent_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "AgentSessionStatus" NOT NULL DEFAULT 'RUNNING',
    "step_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_steps" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "kind" "AgentStepKind" NOT NULL,
    "note" TEXT NOT NULL,
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_sessions_user_id_created_at_idx" ON "agent_sessions"("user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "agent_steps_session_id_index_key" ON "agent_steps"("session_id", "index");

-- AddForeignKey
ALTER TABLE "agent_sessions" ADD CONSTRAINT "agent_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_steps" ADD CONSTRAINT "agent_steps_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "agent_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
