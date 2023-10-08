/*
  Warnings:

  - Added the required column `balance` to the `Organizer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organizer" ADD COLUMN     "balance" INTEGER NOT NULL;
