-- DropIndex
DROP INDEX "UserItems_itemId_idx";

-- CreateIndex
CREATE INDEX "UserItems_userId_idx" ON "UserItems"("userId");
