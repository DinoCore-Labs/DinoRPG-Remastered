/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `UserProfile` table. All the data in the column will be lost.
  - The `language` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `gender` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('FR', 'EN', 'ES', 'DE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "avatarUrl",
ADD COLUMN     "avatar" BYTEA,
ADD COLUMN     "avatarType" TEXT,
DROP COLUMN "language",
ADD COLUMN     "language" "Language",
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender";
