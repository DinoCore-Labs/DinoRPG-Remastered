-- The pool was created in 20261023210000 with a SQL DEFAULT on updatedAt.
-- Prisma schema declares @updatedAt, not @default(now()), so remove that
-- SQL default after the CREATE TABLE migration has executed.
ALTER TABLE "MtDungeonGoldPool" ALTER COLUMN "updatedAt" DROP DEFAULT;
