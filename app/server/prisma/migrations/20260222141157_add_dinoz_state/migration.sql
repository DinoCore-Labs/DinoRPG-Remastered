-- CreateEnum
CREATE TYPE "DinozState" AS ENUM ('frozen', 'sacrificed', 'selling', 'superdom', 'resting', 'unfreezing');

-- AlterTable
ALTER TABLE "Dinoz" ADD COLUMN     "state" "DinozState";
