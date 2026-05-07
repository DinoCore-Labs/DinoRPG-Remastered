-- CreateTable
CREATE TABLE "user_scenario" (
    "id" SERIAL NOT NULL,
    "scenarioKey" TEXT NOT NULL,
    "progression" INTEGER NOT NULL DEFAULT 0,
    "tracking" INTEGER NOT NULL DEFAULT 0,
    "state" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "user_scenario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_scenario_userId_idx" ON "user_scenario"("userId");

-- CreateIndex
CREATE INDEX "user_scenario_scenarioKey_idx" ON "user_scenario"("scenarioKey");

-- CreateIndex
CREATE UNIQUE INDEX "user_scenario_scenarioKey_userId_key" ON "user_scenario"("scenarioKey", "userId");

-- AddForeignKey
ALTER TABLE "user_scenario" ADD CONSTRAINT "user_scenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
