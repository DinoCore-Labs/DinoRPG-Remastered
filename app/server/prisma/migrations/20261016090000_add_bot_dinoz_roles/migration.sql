-- CreateEnum
CREATE TYPE "BotDinozRole" AS ENUM ('FIGHTER', 'GATHERER', 'EXPLORER');

-- AlterTable
ALTER TABLE "bot_dinoz_memory"
ALTER COLUMN "goal" DROP NOT NULL,
ADD COLUMN "role" "BotDinozRole";

-- CreateIndex
CREATE INDEX "bot_dinoz_memory_role_idx" ON "bot_dinoz_memory"("role");
