-- One finite reserve per canonical dungeon, shared across ALL users/groups.
-- Initialized lazily to the value from original dungeons.xml on first IGold pickup.
-- No automatic refill: a depleted reserve stays at zero.
CREATE TABLE "MtDungeonGoldPool" (
    "dungeonId" VARCHAR(64) NOT NULL,
    "initialGold" INTEGER NOT NULL,
    "remainingGold" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MtDungeonGoldPool_pkey" PRIMARY KEY ("dungeonId"),
    CONSTRAINT "MtDungeonGoldPool_valid_reserve" CHECK (
        "initialGold" >= 0 AND "remainingGold" >= 0 AND "remainingGold" <= "initialGold"
    )
);
