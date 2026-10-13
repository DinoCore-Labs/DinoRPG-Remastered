-- CreateEnum
CREATE TYPE "MonsterHuntStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDED', 'REWARDED');

-- CreateTable
CREATE TABLE "monster_hunt" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "status" "MonsterHuntStatus" NOT NULL DEFAULT 'DRAFT',
    "startAt" TIMESTAMPTZ(3) NOT NULL,
    "endAt" TIMESTAMPTZ(3) NOT NULL,
    "softCap" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "monster_hunt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monster_hunt_participant" (
    "id" UUID NOT NULL,
    "huntId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "objects" INTEGER NOT NULL DEFAULT 0,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "dailyKills" INTEGER NOT NULL DEFAULT 0,
    "dailyResetAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "monster_hunt_participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monster_hunt_loot_definition" (
    "id" UUID NOT NULL,
    "huntId" UUID NOT NULL,
    "lootKey" VARCHAR(80) NOT NULL,
    "monsterKey" VARCHAR(80) NOT NULL,
    "nameKey" VARCHAR(120) NOT NULL,
    "icon" VARCHAR(120),
    "points" INTEGER NOT NULL,
    "dropRateBps" INTEGER NOT NULL,
    "spawnWeight" INTEGER NOT NULL DEFAULT 100,
    "globalSpawn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "monster_hunt_loot_definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monster_hunt_participant_loot" (
    "id" UUID NOT NULL,
    "participantId" UUID NOT NULL,
    "lootDefinitionId" UUID NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "monster_hunt_participant_loot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monster_hunt_reward_tier" (
    "id" UUID NOT NULL,
    "huntId" UUID NOT NULL,
    "points" INTEGER NOT NULL,
    "reward" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "monster_hunt_reward_tier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monster_hunt_claimed_reward" (
    "id" UUID NOT NULL,
    "participantId" UUID NOT NULL,
    "rewardTierId" UUID NOT NULL,
    "claimedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monster_hunt_claimed_reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monster_hunt_ranking_reward" (
    "id" UUID NOT NULL,
    "huntId" UUID NOT NULL,
    "rankStart" INTEGER NOT NULL,
    "rankEnd" INTEGER NOT NULL,
    "reward" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "monster_hunt_ranking_reward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monster_hunt_slug_key" ON "monster_hunt"("slug");

-- CreateIndex
CREATE INDEX "monster_hunt_status_idx" ON "monster_hunt"("status");

-- CreateIndex
CREATE INDEX "monster_hunt_startAt_idx" ON "monster_hunt"("startAt");

-- CreateIndex
CREATE INDEX "monster_hunt_endAt_idx" ON "monster_hunt"("endAt");

-- CreateIndex
CREATE INDEX "monster_hunt_status_startAt_endAt_idx" ON "monster_hunt"("status", "startAt", "endAt");

-- CreateIndex
CREATE INDEX "monster_hunt_participant_huntId_points_idx" ON "monster_hunt_participant"("huntId", "points");

-- CreateIndex
CREATE INDEX "monster_hunt_participant_huntId_objects_idx" ON "monster_hunt_participant"("huntId", "objects");

-- CreateIndex
CREATE INDEX "monster_hunt_participant_userId_idx" ON "monster_hunt_participant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "monster_hunt_participant_huntId_userId_key" ON "monster_hunt_participant"("huntId", "userId");

-- CreateIndex
CREATE INDEX "monster_hunt_loot_definition_huntId_idx" ON "monster_hunt_loot_definition"("huntId");

-- CreateIndex
CREATE INDEX "monster_hunt_loot_definition_huntId_monsterKey_idx" ON "monster_hunt_loot_definition"("huntId", "monsterKey");

-- CreateIndex
CREATE UNIQUE INDEX "monster_hunt_loot_definition_huntId_lootKey_key" ON "monster_hunt_loot_definition"("huntId", "lootKey");

-- CreateIndex
CREATE INDEX "monster_hunt_participant_loot_participantId_idx" ON "monster_hunt_participant_loot"("participantId");

-- CreateIndex
CREATE INDEX "monster_hunt_participant_loot_lootDefinitionId_idx" ON "monster_hunt_participant_loot"("lootDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "monster_hunt_participant_loot_participantId_lootDefinitionI_key" ON "monster_hunt_participant_loot"("participantId", "lootDefinitionId");

-- CreateIndex
CREATE INDEX "monster_hunt_reward_tier_huntId_points_idx" ON "monster_hunt_reward_tier"("huntId", "points");

-- CreateIndex
CREATE UNIQUE INDEX "monster_hunt_reward_tier_huntId_points_key" ON "monster_hunt_reward_tier"("huntId", "points");

-- CreateIndex
CREATE INDEX "monster_hunt_claimed_reward_participantId_idx" ON "monster_hunt_claimed_reward"("participantId");

-- CreateIndex
CREATE INDEX "monster_hunt_claimed_reward_rewardTierId_idx" ON "monster_hunt_claimed_reward"("rewardTierId");

-- CreateIndex
CREATE UNIQUE INDEX "monster_hunt_claimed_reward_participantId_rewardTierId_key" ON "monster_hunt_claimed_reward"("participantId", "rewardTierId");

-- CreateIndex
CREATE INDEX "monster_hunt_ranking_reward_huntId_rankStart_idx" ON "monster_hunt_ranking_reward"("huntId", "rankStart");

-- CreateIndex
CREATE UNIQUE INDEX "monster_hunt_ranking_reward_huntId_rankStart_rankEnd_key" ON "monster_hunt_ranking_reward"("huntId", "rankStart", "rankEnd");

-- AddForeignKey
ALTER TABLE "monster_hunt_participant" ADD CONSTRAINT "monster_hunt_participant_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "monster_hunt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_hunt_participant" ADD CONSTRAINT "monster_hunt_participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_hunt_loot_definition" ADD CONSTRAINT "monster_hunt_loot_definition_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "monster_hunt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_hunt_participant_loot" ADD CONSTRAINT "monster_hunt_participant_loot_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "monster_hunt_participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_hunt_participant_loot" ADD CONSTRAINT "monster_hunt_participant_loot_lootDefinitionId_fkey" FOREIGN KEY ("lootDefinitionId") REFERENCES "monster_hunt_loot_definition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_hunt_reward_tier" ADD CONSTRAINT "monster_hunt_reward_tier_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "monster_hunt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_hunt_claimed_reward" ADD CONSTRAINT "monster_hunt_claimed_reward_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "monster_hunt_participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_hunt_claimed_reward" ADD CONSTRAINT "monster_hunt_claimed_reward_rewardTierId_fkey" FOREIGN KEY ("rewardTierId") REFERENCES "monster_hunt_reward_tier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_hunt_ranking_reward" ADD CONSTRAINT "monster_hunt_ranking_reward_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "monster_hunt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
