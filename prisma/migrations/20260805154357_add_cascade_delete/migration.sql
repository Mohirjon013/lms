-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_assistantId_fkey";

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_categoriesId_fkey";

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_sectionsId_fkey";

-- DropForeignKey
ALTER TABLE "sections" DROP CONSTRAINT "sections_coursesId_fkey";

-- DropForeignKey
ALTER TABLE "teacher_profile" DROP CONSTRAINT "teacher_profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "tests" DROP CONSTRAINT "tests_lessonsId_fkey";

-- AddForeignKey
ALTER TABLE "teacher_profile" ADD CONSTRAINT "teacher_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_categoriesId_fkey" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_coursesId_fkey" FOREIGN KEY ("coursesId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_sectionsId_fkey" FOREIGN KEY ("sectionsId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_lessonsId_fkey" FOREIGN KEY ("lessonsId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
