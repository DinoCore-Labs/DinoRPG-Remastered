-- CreateEnum
CREATE TYPE "ForumCategory" AS ENUM ('QUESTIONS', 'GAME', 'CLANS', 'CHAOS');

-- CreateTable
CREATE TABLE "forum_topic" (
    "id" SERIAL NOT NULL,
    "category" "ForumCategory" NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "messageCount" INTEGER NOT NULL DEFAULT 1,
    "authorId" UUID,
    "authorName" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_message" (
    "id" SERIAL NOT NULL,
    "topicId" INTEGER NOT NULL,
    "authorId" UUID,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_favorite" (
    "userId" UUID NOT NULL,
    "topicId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_favorite_pkey" PRIMARY KEY ("userId","topicId")
);

-- CreateIndex
CREATE INDEX "forum_topic_category_isPinned_lastActivityAt_idx" ON "forum_topic"("category", "isPinned", "lastActivityAt");

-- CreateIndex
CREATE INDEX "forum_topic_lastActivityAt_idx" ON "forum_topic"("lastActivityAt");

-- CreateIndex
CREATE INDEX "forum_message_topicId_createdAt_id_idx" ON "forum_message"("topicId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "forum_message_authorId_idx" ON "forum_message"("authorId");

-- CreateIndex
CREATE INDEX "forum_favorite_topicId_idx" ON "forum_favorite"("topicId");

-- AddForeignKey
ALTER TABLE "forum_topic" ADD CONSTRAINT "forum_topic_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_message" ADD CONSTRAINT "forum_message_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "forum_topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_message" ADD CONSTRAINT "forum_message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_favorite" ADD CONSTRAINT "forum_favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_favorite" ADD CONSTRAINT "forum_favorite_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "forum_topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
