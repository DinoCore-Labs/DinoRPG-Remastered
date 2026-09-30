-- CreateEnum
CREATE TYPE "BotProgressionGoal" AS ENUM ('SHAMAN_STRATEGY', 'FORCEBRUT_TRAINING', 'LANTERN');

-- CreateTable
CREATE TABLE "bot_dinoz_memory" (
    "id" SERIAL NOT NULL,
    "dinozId" INTEGER NOT NULL,
    "goal" "BotProgressionGoal" NOT NULL,
    "targetPlaceId" INTEGER,
    "assignedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "bot_dinoz_memory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bot_dinoz_memory_dinozId_key" ON "bot_dinoz_memory"("dinozId");

-- CreateIndex
CREATE INDEX "bot_dinoz_memory_goal_idx" ON "bot_dinoz_memory"("goal");

-- AddForeignKey
ALTER TABLE "bot_dinoz_memory"
ADD CONSTRAINT "bot_dinoz_memory_dinozId_fkey"
FOREIGN KEY ("dinozId") REFERENCES "Dinoz"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
