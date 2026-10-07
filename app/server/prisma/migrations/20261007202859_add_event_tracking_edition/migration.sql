/*
  Warnings:

  - A unique constraint covering the columns `[eventId,edition,userId]` on the table `user_event_tracking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `edition` to the `user_event_tracking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_event_tracking_eventId_idx";

-- DropIndex
DROP INDEX "user_event_tracking_eventId_userId_key";

-- AlterTable
ALTER TABLE "user_event_tracking" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "edition" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "user_event_tracking_eventId_edition_idx" ON "user_event_tracking"("eventId", "edition");

-- CreateIndex
CREATE UNIQUE INDEX "user_event_tracking_eventId_edition_userId_key" ON "user_event_tracking"("eventId", "edition", "userId");
