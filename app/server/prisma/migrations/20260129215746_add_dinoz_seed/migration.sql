/*
  Warnings:

  - Added the required column `seed` to the `Dinoz` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dinoz" ADD COLUMN     "seed" UUID NOT NULL;
