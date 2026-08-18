/*
  Warnings:

  - You are about to drop the column `file` on the `homework_submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "homework_submission" DROP COLUMN "file";

-- CreateTable
CREATE TABLE "submission_files" (
    "id" SERIAL NOT NULL,
    "submissionId" INTEGER NOT NULL,
    "file" TEXT NOT NULL,

    CONSTRAINT "submission_files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "homework_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
