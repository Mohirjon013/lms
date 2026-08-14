/*
  Warnings:

  - The primary key for the `purchased_course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,courseId]` on the table `purchased_course` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "purchased_course" DROP CONSTRAINT "purchased_course_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "purchased_course_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "purchased_course_userId_courseId_key" ON "purchased_course"("userId", "courseId");
