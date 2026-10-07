-- CreateTable
CREATE TABLE "clan_event_tracking" (
    "id" SERIAL NOT NULL,
    "eventId" TEXT NOT NULL,
    "edition" INTEGER NOT NULL,
    "clanId" INTEGER NOT NULL,
    "clanName" VARCHAR NOT NULL,
    "clanLangs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "total" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "clan_event_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clan_event_tracking_eventId_edition_idx" ON "clan_event_tracking"("eventId", "edition");

-- CreateIndex
CREATE INDEX "clan_event_tracking_clanId_idx" ON "clan_event_tracking"("clanId");

-- CreateIndex
CREATE UNIQUE INDEX "clan_event_tracking_eventId_edition_clanId_key" ON "clan_event_tracking"("eventId", "edition", "clanId");
