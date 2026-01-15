-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lang" "Language" NOT NULL DEFAULT 'FR';

-- CreateTable
CREATE TABLE "statsTracking" (
    "id" SERIAL NOT NULL,
    "stat" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "statsTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "statsTracking_userId_key" ON "statsTracking"("userId");

-- CreateIndex
CREATE INDEX "statsTracking_userId_idx" ON "statsTracking"("userId");

-- CreateIndex
CREATE INDEX "statsTracking_stat_idx" ON "statsTracking"("stat");

-- CreateIndex
CREATE UNIQUE INDEX "statsTracking_stat_userId_key" ON "statsTracking"("stat", "userId");

-- AddForeignKey
ALTER TABLE "statsTracking" ADD CONSTRAINT "statsTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
