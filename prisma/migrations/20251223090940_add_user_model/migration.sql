/*
  Warnings:

  - You are about to drop the column `userId` on the `Edge` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `TopicAlias` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sourceId,targetId]` on the table `Edge` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Edge_userId_sourceId_targetId_key";

-- AlterTable
ALTER TABLE "Edge" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "TopicAlias" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Edge_sourceId_targetId_key" ON "Edge"("sourceId", "targetId");

-- Insert demo user to satisfy existing foreign key references
INSERT INTO "User" (id, email, username, password, "createdAt", "updatedAt") 
VALUES ('demo-user', 'demo@example.com', 'demo', '$2a$10$temporary.hash.placeholder', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
