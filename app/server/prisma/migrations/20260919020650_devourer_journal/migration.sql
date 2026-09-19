ALTER TABLE "FightArchive" ADD COLUMN "devourerPlaceId" INTEGER;
CREATE INDEX "FightArchive_devourerPlaceId_createdDate_idx" ON "FightArchive"("devourerPlaceId", "createdDate");
