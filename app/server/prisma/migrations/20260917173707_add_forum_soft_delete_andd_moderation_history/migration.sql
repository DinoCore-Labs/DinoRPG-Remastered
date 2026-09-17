-- CreateEnum
CREATE TYPE "ForumMessageDeletionKind" AS ENUM ('AUTHOR', 'MODERATION');

-- CreateEnum
CREATE TYPE "ForumModerationActionType" AS ENUM ('MESSAGE_DELETE', 'MESSAGE_RESTORE', 'TOPIC_PIN', 'TOPIC_UNPIN', 'TOPIC_CLOSE', 'TOPIC_REOPEN');

-- AlterTable
ALTER TABLE "forum_message" ADD COLUMN     "deletedAt" TIMESTAMPTZ(3),
ADD COLUMN     "deletedById" UUID,
ADD COLUMN     "deletedByName" TEXT,
ADD COLUMN     "deletionKind" "ForumMessageDeletionKind",
ADD COLUMN     "deletionReason" VARCHAR(500);

-- CreateTable
CREATE TABLE "forum_moderation_action" (
    "id" SERIAL NOT NULL,
    "topicId" INTEGER NOT NULL,
    "messageId" INTEGER,
    "actorId" UUID,
    "actorName" TEXT NOT NULL,
    "action" "ForumModerationActionType" NOT NULL,
    "reason" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_moderation_action_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "forum_moderation_action_topicId_createdAt_idx" ON "forum_moderation_action"("topicId", "createdAt");

-- CreateIndex
CREATE INDEX "forum_moderation_action_messageId_idx" ON "forum_moderation_action"("messageId");

-- CreateIndex
CREATE INDEX "forum_moderation_action_actorId_createdAt_idx" ON "forum_moderation_action"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "forum_moderation_action_action_createdAt_idx" ON "forum_moderation_action"("action", "createdAt");

-- CreateIndex
CREATE INDEX "forum_message_topicId_deletedAt_idx" ON "forum_message"("topicId", "deletedAt");
