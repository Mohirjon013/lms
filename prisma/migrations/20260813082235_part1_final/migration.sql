/*
  Warnings:

  - A unique constraint covering the columns `[sectionsId,name]` on the table `lessons` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[coursesId,name]` on the table `sections` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaidVia" AS ENUM ('PAYME', 'CLICK', 'CASH');

-- CreateEnum
CREATE TYPE "HomeworkSubStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'FREEZE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_assistantId_fkey";

-- DropForeignKey
ALTER TABLE "homeworks" DROP CONSTRAINT "homeworks_lessonsId_fkey";

-- DropForeignKey
ALTER TABLE "materials" DROP CONSTRAINT "materials_lessonsId_fkey";

-- DropIndex
DROP INDEX "courses_name_key";

-- DropIndex
DROP INDEX "lessons_name_key";

-- DropIndex
DROP INDEX "sections_name_key";

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'INACTIVE';

-- CreateTable
CREATE TABLE "purchased_course" (
    "userId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30),
    "paidVia" "PaidVia",
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchased_course_pkey" PRIMARY KEY ("userId","courseId")
);

-- CreateTable
CREATE TABLE "rating" (
    "id" SERIAL NOT NULL,
    "rate" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "last_activity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "courseId" INTEGER,
    "sectionId" INTEGER,
    "lessonId" INTEGER,
    "url" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "last_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rating_userId_courseId_key" ON "rating"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "last_activity_userId_key" ON "last_activity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_sectionsId_name_key" ON "lessons"("sectionsId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "sections_coursesId_name_key" ON "sections"("coursesId", "name");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchased_course" ADD CONSTRAINT "purchased_course_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchased_course" ADD CONSTRAINT "purchased_course_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "last_activity" ADD CONSTRAINT "last_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_lessonsId_fkey" FOREIGN KEY ("lessonsId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homeworks" ADD CONSTRAINT "homeworks_lessonsId_fkey" FOREIGN KEY ("lessonsId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
