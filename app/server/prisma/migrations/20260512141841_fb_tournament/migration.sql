-- AlterTable
ALTER TABLE "Dinoz" ADD COLUMN     "FBTournamentStep" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "forcebrut_tournament_opponent" (
    "id" SERIAL NOT NULL,
    "step" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "raceId" INTEGER NOT NULL,
    "display" VARCHAR NOT NULL,
    "level" INTEGER NOT NULL,
    "life" INTEGER NOT NULL DEFAULT 100,
    "maxLife" INTEGER NOT NULL DEFAULT 100,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "nbrUpFire" INTEGER NOT NULL DEFAULT 0,
    "nbrUpWood" INTEGER NOT NULL DEFAULT 0,
    "nbrUpWater" INTEGER NOT NULL DEFAULT 0,
    "nbrUpLightning" INTEGER NOT NULL DEFAULT 0,
    "nbrUpAir" INTEGER NOT NULL DEFAULT 0,
    "skillIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "itemIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "statusIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "forcebrut_tournament_opponent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forcebrut_tournament_opponent_step_key" ON "forcebrut_tournament_opponent"("step");

-- CreateIndex
CREATE INDEX "forcebrut_tournament_opponent_enabled_step_idx" ON "forcebrut_tournament_opponent"("enabled", "step");
