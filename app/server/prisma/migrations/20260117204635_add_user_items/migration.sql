-- DropIndex
DROP INDEX "statsTracking_userId_key";

-- CreateTable
CREATE TABLE "UserItems" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "UserItems_itemId_idx" ON "UserItems"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "UserItems_itemId_userId_key" ON "UserItems"("itemId", "userId");

-- AddForeignKey
ALTER TABLE "UserItems" ADD CONSTRAINT "UserItems_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
