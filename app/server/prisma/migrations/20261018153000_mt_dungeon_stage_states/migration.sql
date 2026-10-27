-- Stage 8: per-map navigation snapshots for six MT dungeon definitions.
-- Non-destructive extension of the isolated MtDungeonRun table.
ALTER TABLE "MtDungeonRun"
  ADD COLUMN "stageStates" JSONB NOT NULL DEFAULT '{}'::jsonb;
