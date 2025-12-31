-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "grade_recording_teacher_id" TEXT;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_grade_recording_teacher_id_fkey" FOREIGN KEY ("grade_recording_teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
