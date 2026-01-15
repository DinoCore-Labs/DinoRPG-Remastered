/*
  Warnings:

  - You are about to drop the column `lang` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "lang";

-- AlterTable
ALTER TABLE "UserProfile" ALTER COLUMN "language" SET DEFAULT 'FR';
