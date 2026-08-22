/*
  Warnings:

  - A unique constraint covering the columns `[lessonsId,userId]` on the table `test_result` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "test_result_lessonsId_userId_key" ON "test_result"("lessonsId", "userId");
