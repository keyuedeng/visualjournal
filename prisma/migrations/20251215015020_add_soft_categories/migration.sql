/*
  Warnings:

  - You are about to drop the column `category` on the `Node` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Node" DROP COLUMN "category",
ADD COLUMN     "categories" TEXT[] DEFAULT ARRAY[]::TEXT[];
