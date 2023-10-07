/*
  Warnings:

  - You are about to drop the column `eventId` on the `EventMember` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventMember" DROP CONSTRAINT "EventMember_eventId_fkey";

-- AlterTable
ALTER TABLE "EventMember" DROP COLUMN "eventId";
