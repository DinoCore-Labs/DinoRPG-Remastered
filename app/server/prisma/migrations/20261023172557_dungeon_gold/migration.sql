-- This migration precedes the creation of MtDungeonGoldPool.
-- The table does not yet exist when Prisma replays migrations in a shadow database.
-- Keep the operation compatible with databases where the table already exists.
ALTER TABLE IF EXISTS "MtDungeonGoldPool" ALTER COLUMN "updatedAt" DROP DEFAULT;
