-- MT stage 10: durable attempts for scenario fights only.
-- No changes to the previous (legacy) DungeonRun/DungeonFightAttempt tables.
CREATE TABLE "MtDungeonFightAttempt" (
    "id" UUID NOT NULL,
    "runId" UUID NOT NULL,
    "token" UUID NOT NULL,
    "mapId" VARCHAR(64) NOT NULL,
    "revision" INTEGER NOT NULL,
    "scenarioIndex" INTEGER NOT NULL,
    "pendingJson" TEXT NOT NULL,
    "monsterKeys" TEXT[] NOT NULL,
    "fightSeed" TEXT NOT NULL,
    "status" VARCHAR(16) NOT NULL DEFAULT 'PREPARED',
    "result" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "MtDungeonFightAttempt_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MtDungeonFightAttempt_status_check" CHECK ("status" IN ('PREPARED','PROCESSING','COMPLETED','REVIEW'))
);
CREATE UNIQUE INDEX "MtDungeonFightAttempt_token_key" ON "MtDungeonFightAttempt"("token");
CREATE UNIQUE INDEX "MtDungeonFightAttempt_runId_revision_key" ON "MtDungeonFightAttempt"("runId", "revision");
CREATE INDEX "MtDungeonFightAttempt_runId_idx" ON "MtDungeonFightAttempt"("runId");
ALTER TABLE "MtDungeonFightAttempt" ADD CONSTRAINT "MtDungeonFightAttempt_runId_fkey"
  FOREIGN KEY ("runId") REFERENCES "MtDungeonRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
