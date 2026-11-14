-- Progression collective, appartenant au clan plutôt qu'aux membres.
CREATE TABLE "ClanActionProgress" (
    "clanId" INTEGER NOT NULL,
    "actionKey" VARCHAR(64) NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "ClanActionProgress_pkey" PRIMARY KEY ("clanId", "actionKey"),
    CONSTRAINT "ClanActionProgress_nonnegative_progress" CHECK ("progress" >= 0)
);

ALTER TABLE "ClanActionProgress" ADD CONSTRAINT "ClanActionProgress_clanId_fkey"
    FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
