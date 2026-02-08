-- AlterTable
ALTER TABLE "Dinoz" ADD COLUMN     "following" INTEGER;

-- AddForeignKey
ALTER TABLE "Dinoz" ADD CONSTRAINT "Dinoz_following_fkey" FOREIGN KEY ("following") REFERENCES "Dinoz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
