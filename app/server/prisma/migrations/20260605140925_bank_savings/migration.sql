-- CreateTable
CREATE TABLE "bank_saving" (
    "id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "interestRateBps" INTEGER NOT NULL,
    "unlockAt" TIMESTAMPTZ(3) NOT NULL,
    "claimedAt" TIMESTAMPTZ(3),
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "bank_saving_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_saving_userId_idx" ON "bank_saving"("userId");

-- CreateIndex
CREATE INDEX "bank_saving_userId_claimedAt_idx" ON "bank_saving"("userId", "claimedAt");

-- CreateIndex
CREATE INDEX "bank_saving_unlockAt_idx" ON "bank_saving"("unlockAt");

-- AddForeignKey
ALTER TABLE "bank_saving" ADD CONSTRAINT "bank_saving_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
