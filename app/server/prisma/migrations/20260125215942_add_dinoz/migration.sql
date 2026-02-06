-- CreateTable
CREATE TABLE "Dinoz" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "canRename" BOOLEAN NOT NULL DEFAULT false,
    "raceId" INTEGER NOT NULL,
    "display" VARCHAR NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "life" INTEGER NOT NULL,
    "maxLife" INTEGER NOT NULL,
    "experience" INTEGER NOT NULL,
    "nbrUpFire" INTEGER NOT NULL,
    "nbrUpWood" INTEGER NOT NULL,
    "nbrUpWater" INTEGER NOT NULL,
    "nbrUpLightning" INTEGER NOT NULL,
    "nbrUpAir" INTEGER NOT NULL,
    "nextUpElementId" INTEGER NOT NULL,
    "nextUpAltElementId" INTEGER NOT NULL,
    "placeId" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL DEFAULT 3,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Dinoz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dinoz_userId_idx" ON "Dinoz"("userId");

-- AddForeignKey
ALTER TABLE "Dinoz" ADD CONSTRAINT "Dinoz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
