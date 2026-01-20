/*
  Warnings:

  - You are about to drop the `UserItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserItems" DROP CONSTRAINT "UserItems_userId_fkey";

-- DropTable
DROP TABLE "UserItems";

-- CreateTable
CREATE TABLE "user_ingredients" (
    "id" SERIAL NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "user_items" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "user_ingredients_userId_idx" ON "user_ingredients"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_ingredients_ingredientId_userId_key" ON "user_ingredients"("ingredientId", "userId");

-- CreateIndex
CREATE INDEX "user_items_userId_idx" ON "user_items"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_items_itemId_userId_key" ON "user_items"("itemId", "userId");

-- AddForeignKey
ALTER TABLE "user_ingredients" ADD CONSTRAINT "user_ingredients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
