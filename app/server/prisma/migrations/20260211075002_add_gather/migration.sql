-- AlterTable
ALTER TABLE "Dinoz" ADD COLUMN     "gather" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "user_gather" (
    "id" SERIAL NOT NULL,
    "place" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "grid" INTEGER[],
    "userId" UUID,

    CONSTRAINT "user_gather_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_gather_userId_idx" ON "user_gather"("userId");

-- AddForeignKey
ALTER TABLE "user_gather" ADD CONSTRAINT "user_gather_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
