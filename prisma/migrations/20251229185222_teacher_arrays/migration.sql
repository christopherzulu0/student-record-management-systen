/*
  Warnings:

  - The `teacher_id` column on the `courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_teacher_id_fkey";

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "teacher_id",
ADD COLUMN     "teacher_id" TEXT[];

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
