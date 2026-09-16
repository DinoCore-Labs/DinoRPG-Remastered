-- CreateTable
CREATE TABLE "forum_topic_read" (
    "userId" UUID NOT NULL,
    "topicId" INTEGER NOT NULL,
    "lastReadMessageId" INTEGER NOT NULL,
    "readAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_topic_read_pkey" PRIMARY KEY ("userId","topicId")
);

-- CreateIndex
CREATE INDEX "forum_topic_read_topicId_idx" ON "forum_topic_read"("topicId");

-- AddForeignKey
ALTER TABLE "forum_topic_read" ADD CONSTRAINT "forum_topic_read_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_topic_read" ADD CONSTRAINT "forum_topic_read_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "forum_topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
