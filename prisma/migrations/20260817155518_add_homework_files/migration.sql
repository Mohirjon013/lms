/*
  Warnings:

  - You are about to drop the column `file` on the `homeworks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "homeworks" DROP COLUMN "file";

-- CreateTable
CREATE TABLE "homework_files" (
    "id" SERIAL NOT NULL,
    "homeworkId" INTEGER NOT NULL,
    "file" TEXT NOT NULL,

    CONSTRAINT "homework_files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "homework_files" ADD CONSTRAINT "homework_files_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "homeworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
