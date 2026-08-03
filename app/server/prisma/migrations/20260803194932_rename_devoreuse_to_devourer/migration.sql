-- AlterTable
ALTER TABLE "Dinoz" ADD COLUMN     "devourerDefendedId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "devourerAttacksLeft" INTEGER NOT NULL DEFAULT 3;

-- CreateTable
CREATE TABLE "DevourerControl" (
    "id" SERIAL NOT NULL,
    "placeId" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DevourerControl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DevourerControl_placeId_key" ON "DevourerControl"("placeId");

-- CreateIndex
CREATE INDEX "DevourerControl_userId_idx" ON "DevourerControl"("userId");

-- AddForeignKey
ALTER TABLE "Dinoz" ADD CONSTRAINT "Dinoz_devourerDefendedId_fkey" FOREIGN KEY ("devourerDefendedId") REFERENCES "DevourerControl"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevourerControl" ADD CONSTRAINT "DevourerControl_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
