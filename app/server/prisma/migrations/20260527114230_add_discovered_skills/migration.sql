-- AlterTable
ALTER TABLE "User" ADD COLUMN     "discoveredSkills" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
