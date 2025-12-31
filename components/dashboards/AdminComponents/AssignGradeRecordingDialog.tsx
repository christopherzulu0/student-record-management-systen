'use client'
import React, { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useUpdateCourse, type Course } from "@/lib/hooks/use-courses"
import { useTeachers } from "@/lib/hooks/use-teachers-assign"
import { toast } from "sonner"

interface AssignGradeRecordingDialogProps {
  course: Course | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function AssignGradeRecordingFormContent({ course, onOpenChange }: { course: Course; onOpenChange: (open: boolean) => void }) {
  const [gradeRecordingTeacherId, setGradeRecordingTeacherId] = useState("")
  
  const updateCourse = useUpdateCourse()
  const { data: teachers } = useTeachers()

  useEffect(() => {
    if (course) {
      setGradeRecordingTeacherId(course.gradeRecordingTeacherId || "")
    }
  }, [course])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!course) return

    try {
      await updateCourse.mutateAsync({
        id: course.id,
        data: {
          courseCode: course.courseCode,
          name: course.name,
          description: course.description || null,
          credits: course.credits,
          departmentId: course.departmentId || undefined,
          status: course.status,
          teacherId: course.teacherId || undefined,
          gradeRecordingTeacherId: gradeRecordingTeacherId && gradeRecordingTeacherId !== "__none__" ? gradeRecordingTeacherId : null,
        },
      })
      
      toast.success("Grade recording teacher assigned successfully")
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to assign grade recording teacher"
      toast.error(errorMessage)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="grade-recording-teacher">Grade Recording Teacher</Label>
        <Select 
          value={gradeRecordingTeacherId || undefined} 
          onValueChange={(value) => setGradeRecordingTeacherId(value || "")}
        >
          <SelectTrigger id="grade-recording-teacher">
            <SelectValue placeholder="Select teacher (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None (All assigned teachers can record)</SelectItem>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name} {teacher.email ? `(${teacher.email})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {course.teacher 
            ? `Only the selected teacher can record grades for "${course.courseCode} - ${course.name}". Leave as "None" to allow all assigned teachers to record grades.`
            : `Select a teacher who can record grades for "${course.courseCode} - ${course.name}". If no teacher is selected, any teacher assigned to this course can record grades.`}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => onOpenChange(false)}
          disabled={updateCourse.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={updateCourse.isPending}
        >
          {updateCourse.isPending ? "Saving..." : "Save Assignment"}
        </Button>
      </div>
    </form>
  )
}

export function AssignGradeRecordingDialog({ course, isOpen, onOpenChange }: AssignGradeRecordingDialogProps) {
  if (!course) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Grade Recording Teacher</DialogTitle>
          <DialogDescription>
            {course.courseCode} - {course.name}
          </DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <AssignGradeRecordingFormContent course={course} onOpenChange={onOpenChange} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}

