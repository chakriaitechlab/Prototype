-- CreateEnum
CREATE TYPE "LearnMessageRole" AS ENUM ('user', 'assistant');

-- CreateTable
CREATE TABLE "learn_chats" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New chat',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learn_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learn_messages" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "role" "LearnMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learn_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learn_chats_user_id_updated_at_idx" ON "learn_chats"("user_id", "updated_at" DESC);

-- CreateIndex
CREATE INDEX "learn_messages_chat_id_created_at_idx" ON "learn_messages"("chat_id", "created_at");

-- AddForeignKey
ALTER TABLE "learn_chats" ADD CONSTRAINT "learn_chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learn_messages" ADD CONSTRAINT "learn_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "learn_chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
