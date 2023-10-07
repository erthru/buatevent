/*
  Warnings:

  - Added the required column `invoiceLink` to the `EventMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventMember" ADD COLUMN     "invoiceLink" TEXT NOT NULL;
