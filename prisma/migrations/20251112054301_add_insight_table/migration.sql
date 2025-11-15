/*
  Warnings:

  - You are about to alter the column `title` on the `Entry` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "Entry" ALTER COLUMN "title" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "topics" TEXT[],
    "sentiment" DOUBLE PRECISION NOT NULL,
    "emotions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Insight_entryId_key" ON "Insight"("entryId");

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
