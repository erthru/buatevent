/*
  Warnings:

  - Added the required column `invoiceId` to the `EventMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventMember" ADD COLUMN     "invoiceId" TEXT NOT NULL;
