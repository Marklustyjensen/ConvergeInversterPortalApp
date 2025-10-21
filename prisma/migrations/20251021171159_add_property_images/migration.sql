/*
  Warnings:

  - You are about to drop the column `investment` on the `UserProperty` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `UserProperty` table. All the data in the column will be lost.
  - You are about to drop the column `joinedAt` on the `UserProperty` table. All the data in the column will be lost.
  - You are about to drop the column `percentage` on the `UserProperty` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `UserProperty` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "images" TEXT[],
ADD COLUMN     "primaryImage" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "admin" SET DEFAULT false;

-- AlterTable
ALTER TABLE "UserProperty" DROP COLUMN "investment",
DROP COLUMN "isActive",
DROP COLUMN "joinedAt",
DROP COLUMN "percentage",
DROP COLUMN "role";
