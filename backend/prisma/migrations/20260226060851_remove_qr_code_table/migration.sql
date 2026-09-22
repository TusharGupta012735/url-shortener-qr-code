/*
  Warnings:

  - You are about to drop the `qrcodes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "qrcodes" DROP CONSTRAINT "qrcodes_guestId_fkey";

-- DropForeignKey
ALTER TABLE "qrcodes" DROP CONSTRAINT "qrcodes_urlId_fkey";

-- DropForeignKey
ALTER TABLE "qrcodes" DROP CONSTRAINT "qrcodes_userId_fkey";

-- DropTable
DROP TABLE "qrcodes";
