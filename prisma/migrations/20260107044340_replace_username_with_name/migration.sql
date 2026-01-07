/*
  Warnings:

  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."User_username_key";

-- AlterTable: Add name column as optional first
ALTER TABLE "User" ADD COLUMN "name" TEXT;

-- Copy existing username values to name field
UPDATE "User" SET "name" = "username" WHERE "name" IS NULL;

-- Make name required now that all rows have values
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- Drop username column
ALTER TABLE "User" DROP COLUMN "username";
