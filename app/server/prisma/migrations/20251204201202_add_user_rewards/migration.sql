-- CreateTable
CREATE TABLE "UserRewards" (
    "id" SERIAL NOT NULL,
    "rewardId" INTEGER NOT NULL,
    "userId" TEXT,

    CONSTRAINT "UserRewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRewards_rewardId_userId_key" ON "UserRewards"("rewardId", "userId");

-- AddForeignKey
ALTER TABLE "UserRewards" ADD CONSTRAINT "UserRewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
