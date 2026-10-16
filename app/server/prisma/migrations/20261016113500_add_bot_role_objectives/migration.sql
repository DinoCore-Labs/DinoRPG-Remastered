-- CreateEnum
CREATE TYPE "BotRoleObjective" AS ENUM (
    'FIGHTER_POWER',
    'GATHERER_MERCHANT',
    'GATHERER_HARVEST',
    'EXPLORER_DISCOVERY'
);

-- AlterTable
ALTER TABLE "bot_dinoz_memory"
ADD COLUMN "objective" "BotRoleObjective";

-- CreateIndex
CREATE INDEX "bot_dinoz_memory_objective_idx" ON "bot_dinoz_memory"("objective");
