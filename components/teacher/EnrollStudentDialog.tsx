"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEnrollmentData, useEnrollStudent } from "@/lib/hooks/use-enrollment"
import { Loader2, Plus, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export function EnrollStudentDialog() {
  const [open, setOpen] = useState(false)
  const [studentId, setStudentId] = useState("")
  const [courseId, setCourseId] = useState("")
  const [semesterId, setSemesterId] = useState("")

  const { data, isLoading, error } = useEnrollmentData()
  const enrollMutation = useEnrollStudent()

  // Auto-select active semester when data loads
  useEffect(() => {
    if (data?.semesters && !semesterId) {
      const activeSemester = data.semesters.find(s => s.isActive) || data.semesters[0]
      if (activeSemester) {
        setSemesterId(activeSemester.id)
      }
    }
  }, [data, semesterId])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setStudentId("")
      setCourseId("")
      const activeSemester = data?.semesters.find(s => s.isActive) || data?.semesters[0]
      setSemesterId(activeSemester?.id || "")
    }
  }, [open, data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentId || !courseId || !semesterId) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      await enrollMutation.mutateAsync({
        studentId,
        courseId,
        semesterId,
      })
      
      toast.success("Student enrolled successfully!")
      setOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to enroll student")
    }
  }

  const activeSemester = data?.semesters.find(s => s.isActive) || data?.semesters[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enroll Student in Course</DialogTitle>
          <DialogDescription>
            Add a student to one of your courses for a specific semester.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-600">
              {error instanceof Error ? error.message : "Failed to load enrollment data"}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select value={studentId} onValueChange={setStudentId} required>
                <SelectTrigger id="student">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {data?.students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.studentId} - {student.name} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Select value={courseId} onValueChange={setCourseId} required>
                <SelectTrigger id="course">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {data?.courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.courseCode} - {course.name} ({course.credits} credits)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select 
                value={semesterId} 
                onValueChange={setSemesterId} 
                required
              >
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select a semester" />
                </SelectTrigger>
                <SelectContent>
                  {data?.semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      {semester.name} {semester.isActive && "(Active)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeSemester && semesterId === activeSemester.id && (
                <p className="text-xs text-muted-foreground">
                  Active semester selected
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={enrollMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={enrollMutation.isPending}>
                {enrollMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Enroll Student
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

