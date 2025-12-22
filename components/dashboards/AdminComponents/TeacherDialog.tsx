'use client'

import React, { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserCheck, Loader2 } from "lucide-react"

import { useCourses } from "@/lib/hooks/use-courses"
import { useSemesters } from "@/lib/hooks/use-semesters"
import { useUpdateCourse } from "@/lib/hooks/use-courses"
import { toast } from "sonner"
import { useTeachers } from "@/lib/hooks/use-teachers-assign"

function AssignTeacherFormContent({ onSuccess }: { onSuccess: () => void }) {
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  
  const { data: teachers } = useTeachers()
  const { data: courses } = useCourses()
  const { data: semesters } = useSemesters()
  const updateCourse = useUpdateCourse()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCourse) {
      toast.error("Please select a course")
      return
    }

    if (!selectedTeacher) {
      toast.error("Please select a teacher")
      return
    }

    // Find the selected course
    const course = courses.find(c => c.id === selectedCourse)
    if (!course) {
      toast.error("Course not found")
      return
    }

    try {
      // Update the course with the selected teacher
      await updateCourse.mutateAsync({
        id: selectedCourse,
        data: {
          courseCode: course.courseCode,
          name: course.name,
          description: course.description,
          credits: course.credits,
          departmentId: course.departmentId || undefined,
          status: course.status,
          teacherId: selectedTeacher,
        },
      })
      
      toast.success("Teacher assigned to course successfully")
      
      // Reset form
      setSelectedCourse("")
      setSelectedTeacher("")
      setSelectedSemester("")
      
      // Close dialog
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to assign teacher")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="select-course">Course *</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger id="select-course">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.courseCode} - {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="select-teacher">Teacher *</Label>
        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
          <SelectTrigger id="select-teacher">
            <SelectValue placeholder="Select a teacher" />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name}
                {teacher.department && ` - ${teacher.department}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="semester">Semester (Optional)</Label>
        <Select value={selectedSemester || undefined} onValueChange={(value) => setSelectedSemester(value === "__none__" ? "" : value)}>
          <SelectTrigger id="semester">
            <SelectValue placeholder="Select semester (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {semesters.map((semester) => (
              <SelectItem key={semester.id} value={semester.id}>
                {semester.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Note: Semester selection is optional. The teacher will be assigned to the course for all semesters.
        </p>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={updateCourse.isPending}
      >
        {updateCourse.isPending ? "Assigning..." : "Assign Teacher"}
      </Button>
    </form>
  )
}

export default function TeacherDialog() {
  const [isAssignTeacherOpen, setIsAssignTeacherOpen] = useState(false)

  return (
    <Dialog open={isAssignTeacherOpen} onOpenChange={setIsAssignTeacherOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-green-600 hover:bg-green-700">
          <UserCheck className="h-4 w-4" />
          Assign Teacher
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Teacher to Course</DialogTitle>
          <DialogDescription>Assign a teacher to teach a specific course</DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <AssignTeacherFormContent onSuccess={() => setIsAssignTeacherOpen(false)} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}