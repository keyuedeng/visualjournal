/*
  Warnings:

  - Added the required column `chunkIndex` to the `Insight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Insight" ADD COLUMN     "chunkIndex" INTEGER NOT NULL;
