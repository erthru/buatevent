/*
  Warnings:

  - A unique constraint covering the columns `[validationCode]` on the table `EventMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `validationCode` to the `EventMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventMember" ADD COLUMN     "validationCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EventMember_validationCode_key" ON "EventMember"("validationCode");
