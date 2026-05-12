/*
  Warnings:

  - You are about to drop the column `experience` on the `forcebrut_tournament_opponent` table. All the data in the column will be lost.
  - You are about to drop the column `itemIds` on the `forcebrut_tournament_opponent` table. All the data in the column will be lost.
  - You are about to drop the column `statusIds` on the `forcebrut_tournament_opponent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "forcebrut_tournament_opponent" DROP COLUMN "experience",
DROP COLUMN "itemIds",
DROP COLUMN "statusIds";
