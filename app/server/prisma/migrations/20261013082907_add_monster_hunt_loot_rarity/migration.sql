/*
  Warnings:

  - Added the required column `rarity` to the `monster_hunt_loot_definition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "monster_hunt_loot_definition" ADD COLUMN     "rarity" VARCHAR(20) NOT NULL;
