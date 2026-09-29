-- CreateEnum
CREATE TYPE "BotStrategy" AS ENUM ('BALANCED', 'FIGHTER', 'GATHERER', 'EXPLORER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "isBot" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "bot_profile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "strategy" "BotStrategy" NOT NULL DEFAULT 'BALANCED',
    "minDelaySeconds" INTEGER NOT NULL DEFAULT 60,
    "maxDelaySeconds" INTEGER NOT NULL DEFAULT 600,
    "lastActionAt" TIMESTAMPTZ(3),
    "nextActionAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "bot_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bot_profile_userId_key" ON "bot_profile"("userId");

-- CreateIndex
CREATE INDEX "bot_profile_enabled_nextActionAt_idx" ON "bot_profile"("enabled", "nextActionAt");

-- AddForeignKey
ALTER TABLE "bot_profile"
ADD CONSTRAINT "bot_profile_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
