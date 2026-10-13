-- CreateTable
CREATE TABLE "monster_hunt_ranking_reward_claim" (
    "id" UUID NOT NULL,
    "huntId" UUID NOT NULL,
    "participantId" UUID NOT NULL,
    "rankingRewardId" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "claimedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monster_hunt_ranking_reward_claim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "monster_hunt_ranking_reward_claim_huntId_idx" ON "monster_hunt_ranking_reward_claim"("huntId");

-- CreateIndex
CREATE INDEX "monster_hunt_ranking_reward_claim_participantId_idx" ON "monster_hunt_ranking_reward_claim"("participantId");

-- CreateIndex
CREATE INDEX "monster_hunt_ranking_reward_claim_rankingRewardId_idx" ON "monster_hunt_ranking_reward_claim"("rankingRewardId");

-- CreateIndex
CREATE UNIQUE INDEX "monster_hunt_ranking_reward_claim_participantId_rankingRewa_key" ON "monster_hunt_ranking_reward_claim"("participantId", "rankingRewardId");

-- AddForeignKey
ALTER TABLE "monster_hunt_ranking_reward_claim" ADD CONSTRAINT "monster_hunt_ranking_reward_claim_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "monster_hunt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_hunt_ranking_reward_claim" ADD CONSTRAINT "monster_hunt_ranking_reward_claim_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "monster_hunt_participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_hunt_ranking_reward_claim" ADD CONSTRAINT "monster_hunt_ranking_reward_claim_rankingRewardId_fkey" FOREIGN KEY ("rankingRewardId") REFERENCES "monster_hunt_ranking_reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
