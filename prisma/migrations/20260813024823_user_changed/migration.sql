/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `teacher_profile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "teacher_profile_userId_key" ON "teacher_profile"("userId");
