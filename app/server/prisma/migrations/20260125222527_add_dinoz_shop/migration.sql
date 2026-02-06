/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `userId` column on the `UserRewards` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UserWallet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `userId` on the `Dinoz` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Ranking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `UserProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `UserWallet` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `UserWallet` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `statsTracking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `user_ingredients` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `user_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Dinoz" DROP CONSTRAINT "Dinoz_userId_fkey";

-- DropForeignKey
ALTER TABLE "Ranking" DROP CONSTRAINT "Ranking_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserRewards" DROP CONSTRAINT "UserRewards_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserWallet" DROP CONSTRAINT "UserWallet_userId_fkey";

-- DropForeignKey
ALTER TABLE "statsTracking" DROP CONSTRAINT "statsTracking_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_ingredients" DROP CONSTRAINT "user_ingredients_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_items" DROP CONSTRAINT "user_items_userId_fkey";

-- AlterTable
ALTER TABLE "Dinoz" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Ranking" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "UserRewards" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID;

-- AlterTable
ALTER TABLE "UserWallet" DROP CONSTRAINT "UserWallet_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "UserWallet_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "statsTracking" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "user_ingredients" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "user_items" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "user_dinoz_shop" (
    "id" SERIAL NOT NULL,
    "raceId" INTEGER NOT NULL,
    "display" VARCHAR NOT NULL,
    "userId" UUID,

    CONSTRAINT "user_dinoz_shop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dinoz_userId_idx" ON "Dinoz"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ranking_userId_key" ON "Ranking"("userId");

-- CreateIndex
CREATE INDEX "Ranking_userId_idx" ON "Ranking"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRewards_rewardId_userId_key" ON "UserRewards"("rewardId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWallet_userId_type_key" ON "UserWallet"("userId", "type");

-- CreateIndex
CREATE INDEX "statsTracking_userId_idx" ON "statsTracking"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "statsTracking_stat_userId_key" ON "statsTracking"("stat", "userId");

-- CreateIndex
CREATE INDEX "user_ingredients_userId_idx" ON "user_ingredients"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_ingredients_ingredientId_userId_key" ON "user_ingredients"("ingredientId", "userId");

-- CreateIndex
CREATE INDEX "user_items_userId_idx" ON "user_items"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_items_itemId_userId_key" ON "user_items"("itemId", "userId");

-- AddForeignKey
ALTER TABLE "Dinoz" ADD CONSTRAINT "Dinoz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_dinoz_shop" ADD CONSTRAINT "user_dinoz_shop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_ingredients" ADD CONSTRAINT "user_ingredients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRewards" ADD CONSTRAINT "UserRewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statsTracking" ADD CONSTRAINT "statsTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWallet" ADD CONSTRAINT "UserWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
