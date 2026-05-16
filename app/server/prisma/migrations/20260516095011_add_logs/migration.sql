-- CreateEnum
CREATE TYPE "GameLogRetention" AS ENUM ('TEMPORARY', 'AUDIT');

-- CreateEnum
CREATE TYPE "GameLogType" AS ENUM ('PlayerCreated', 'PlayerConnected', 'PlayerReset', 'PlayerDeleted', 'PlayerBanned', 'PlayerUnbanned', 'CreateDinoz', 'Move', 'LevelUp', 'XPEarned', 'HPLost', 'Death', 'Revive', 'Fight', 'FightWon', 'FightLost', 'ItemUsed', 'ItemBought', 'ItemFound', 'IngredientSold', 'GoldWon', 'GoldLost', 'MissionFinished', 'MissionCanceled', 'Gather', 'GridFinished', 'OfferNew', 'OfferBid', 'OfferCancelled', 'OfferExpired', 'OfferWon', 'AdminUpdateDinoz', 'AdminAddStatus', 'AdminRemoveStatus', 'AdminAddSkill', 'AdminRemoveSkill', 'AdminAddUnlockableSkill', 'AdminRemoveUnlockableSkill', 'AdminAddMoney', 'AdminRemoveMoney', 'AdminAddReward', 'AdminRemoveReward', 'AdminAddItem', 'AdminRemoveItem', 'AdminAddIngredient', 'AdminRemoveIngredient', 'AdminUpdateMission', 'AdminUpdateScenario', 'AdminUpdateUser', 'AdminUpdateSecret');

-- CreateTable
CREATE TABLE "game_log" (
    "id" BIGSERIAL NOT NULL,
    "type" "GameLogType" NOT NULL,
    "retention" "GameLogRetention" NOT NULL DEFAULT 'TEMPORARY',
    "values" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "userId" UUID,
    "dinozId" INTEGER,
    "actorUserId" UUID,
    "userNameSnapshot" TEXT,
    "dinozNameSnapshot" TEXT,
    "actorNameSnapshot" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_log_hourly" (
    "id" BIGSERIAL NOT NULL,
    "type" "GameLogType" NOT NULL,
    "bucketAt" TIMESTAMPTZ(3) NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "game_log_hourly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_log_daily" (
    "id" BIGSERIAL NOT NULL,
    "type" "GameLogType" NOT NULL,
    "day" DATE NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "game_log_daily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_log_userId_dinozId_type_idx" ON "game_log"("userId", "dinozId", "type");

-- CreateIndex
CREATE INDEX "game_log_type_createdAt_idx" ON "game_log"("type", "createdAt");

-- CreateIndex
CREATE INDEX "game_log_retention_createdAt_idx" ON "game_log"("retention", "createdAt");

-- CreateIndex
CREATE INDEX "game_log_createdAt_idx" ON "game_log"("createdAt");

-- CreateIndex
CREATE INDEX "game_log_userId_createdAt_idx" ON "game_log"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "game_log_dinozId_createdAt_idx" ON "game_log"("dinozId", "createdAt");

-- CreateIndex
CREATE INDEX "game_log_actorUserId_createdAt_idx" ON "game_log"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "game_log_hourly_bucketAt_idx" ON "game_log_hourly"("bucketAt");

-- CreateIndex
CREATE INDEX "game_log_hourly_type_bucketAt_idx" ON "game_log_hourly"("type", "bucketAt");

-- CreateIndex
CREATE UNIQUE INDEX "game_log_hourly_type_bucketAt_key" ON "game_log_hourly"("type", "bucketAt");

-- CreateIndex
CREATE INDEX "game_log_daily_day_idx" ON "game_log_daily"("day");

-- CreateIndex
CREATE INDEX "game_log_daily_type_day_idx" ON "game_log_daily"("type", "day");

-- CreateIndex
CREATE UNIQUE INDEX "game_log_daily_type_day_key" ON "game_log_daily"("type", "day");

-- AddForeignKey
ALTER TABLE "game_log" ADD CONSTRAINT "game_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_log" ADD CONSTRAINT "game_log_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "Dinoz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_log" ADD CONSTRAINT "game_log_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
