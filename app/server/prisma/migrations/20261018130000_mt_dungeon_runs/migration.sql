-- Étape 7 MT: persistence isolée, sans modification des anciennes tables DungeonRun.
-- Ne pas déployer en production avant validation sur une base de développement.
CREATE TABLE "MtDungeonRun" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "leaderDinozId" INTEGER NOT NULL,
    "mapId" VARCHAR(64) NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "l" INTEGER NOT NULL,
    "keys" BOOLEAN[] NOT NULL DEFAULT ARRAY[]::BOOLEAN[],
    "flags" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
    "fog" BYTEA,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "pending" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "MtDungeonRun_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MtDungeonRun_userId_leaderDinozId_key" ON "MtDungeonRun"("userId", "leaderDinozId");
CREATE INDEX "MtDungeonRun_userId_idx" ON "MtDungeonRun"("userId");
ALTER TABLE "MtDungeonRun" ADD CONSTRAINT "MtDungeonRun_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MtDungeonRun" ADD CONSTRAINT "MtDungeonRun_leaderDinozId_fkey"
    FOREIGN KEY ("leaderDinozId") REFERENCES "Dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
