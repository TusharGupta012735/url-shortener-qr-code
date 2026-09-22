/*
  Warnings:

  - You are about to drop the column `timestamp` on the `analytics` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eventId]` on the table `analytics` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `analytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `occurredAt` to the `analytics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "analytics" DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "occurredAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "analytics_eventId_key" ON "analytics"("eventId");
