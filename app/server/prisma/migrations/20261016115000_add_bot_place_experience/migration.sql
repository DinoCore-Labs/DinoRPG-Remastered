-- CreateTable
CREATE TABLE "bot_dinoz_place_memory" (
    "id" SERIAL NOT NULL,
    "dinozId" INTEGER NOT NULL,
    "placeId" INTEGER NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "gatherAttempts" INTEGER NOT NULL DEFAULT 0,
    "gatherSuccesses" INTEGER NOT NULL DEFAULT 0,
    "gatherValue" INTEGER NOT NULL DEFAULT 0,
    "fights" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "hpLost" INTEGER NOT NULL DEFAULT 0,
    "lastVisitedAt" TIMESTAMPTZ(3),
    "lastGatherAt" TIMESTAMPTZ(3),
    "lastFightAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "bot_dinoz_place_memory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bot_dinoz_place_memory_dinozId_placeId_key"
ON "bot_dinoz_place_memory"("dinozId", "placeId");

-- CreateIndex
CREATE INDEX "bot_dinoz_place_memory_dinozId_idx"
ON "bot_dinoz_place_memory"("dinozId");

-- CreateIndex
CREATE INDEX "bot_dinoz_place_memory_placeId_idx"
ON "bot_dinoz_place_memory"("placeId");

-- AddForeignKey
ALTER TABLE "bot_dinoz_place_memory"
ADD CONSTRAINT "bot_dinoz_place_memory_dinozId_fkey"
FOREIGN KEY ("dinozId") REFERENCES "Dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
