-- CreateTable
CREATE TABLE "forum_subscription" (
    "userId" UUID NOT NULL,
    "topicId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_subscription_pkey" PRIMARY KEY ("userId","topicId")
);

-- CreateIndex
CREATE INDEX "forum_subscription_topicId_idx" ON "forum_subscription"("topicId");

-- AddForeignKey
ALTER TABLE "forum_subscription" ADD CONSTRAINT "forum_subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_subscription" ADD CONSTRAINT "forum_subscription_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "forum_topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
