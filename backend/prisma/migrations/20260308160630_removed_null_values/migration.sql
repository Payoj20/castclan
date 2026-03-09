/*
  Warnings:

  - You are about to drop the column `guestName` on the `Participant` table. All the data in the column will be lost.
  - Made the column `userId` on table `Participant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Participant" DROP COLUMN "guestName",
ALTER COLUMN "userId" SET NOT NULL;
