-- Progress survives MtDungeonRun deletion. The live session stays the sole
-- authoritative source while exploring; export it atomically on termination.
CREATE TABLE "MtDungeonProgress" (
    "userId" UUID NOT NULL,
    "leaderDinozId" INTEGER NOT NULL,
    "dungeonId" VARCHAR(64) NOT NULL,
    "stageStates" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MtDungeonProgress_pkey" PRIMARY KEY ("userId", "leaderDinozId", "dungeonId")
);

CREATE INDEX "MtDungeonProgress_leaderDinozId_idx" ON "MtDungeonProgress"("leaderDinozId");
ALTER TABLE "MtDungeonProgress" ADD CONSTRAINT "MtDungeonProgress_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MtDungeonProgress" ADD CONSTRAINT "MtDungeonProgress_leaderDinozId_fkey"
    FOREIGN KEY ("leaderDinozId") REFERENCES "Dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
