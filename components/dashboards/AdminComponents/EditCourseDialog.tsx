'use client'
import React, { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useUpdateCourse, type Course } from "@/lib/hooks/use-courses"
import { useDepartments } from "@/lib/hooks/use-departments"
import { toast } from "sonner"

interface EditCourseDialogProps {
  course: Course | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function EditCourseFormContent({ course, onOpenChange }: { course: Course; onOpenChange: (open: boolean) => void }) {
  const [courseCode, setCourseCode] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [credits, setCredits] = useState("3")
  const [departmentId, setDepartmentId] = useState("")
  const [status, setStatus] = useState("active")
  const [courseCodeError, setCourseCodeError] = useState("")
  
  const updateCourse = useUpdateCourse()
  const { data: departments } = useDepartments()

  useEffect(() => {
    if (course) {
      setCourseCode(course.courseCode)
      setName(course.name)
      setDescription(course.description || "")
      setCredits(course.credits.toString())
      setDepartmentId(course.departmentId || "")
      setStatus(course.status)
      setCourseCodeError("")
    }
  }, [course])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!course) return

    setCourseCodeError("") // Clear previous errors

    // Validate required fields
    if (!courseCode.trim() || !name.trim()) {
      toast.error("Course code and name are required")
      return
    }

    try {
      await updateCourse.mutateAsync({
        id: course.id,
        data: {
          courseCode: courseCode.trim(),
          name: name.trim(),
          description: description.trim() || null,
          credits: credits ? parseInt(credits) : 3,
          departmentId: departmentId && departmentId !== "__none__" ? departmentId : undefined,
          status,
        },
      })
      
      toast.success("Course updated successfully")
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update course"
      toast.error(errorMessage)
      
      // If it's a course code conflict, highlight the field
      if (errorMessage.includes("already exists") || errorMessage.includes("Course code")) {
        setCourseCodeError(errorMessage)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-course-code">Course Code *</Label>
        <Input
          id="edit-course-code"
          placeholder="e.g., CS102"
          value={courseCode}
          onChange={(e) => {
            setCourseCode(e.target.value)
            setCourseCodeError("")
          }}
          className={courseCodeError ? "border-destructive" : ""}
          required
        />
        {courseCodeError && (
          <p className="text-sm text-destructive">{courseCodeError}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-course-name">Course Name *</Label>
        <Input
          id="edit-course-name"
          placeholder="e.g., Advanced Web Development"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-course-description">Description</Label>
        <Textarea
          id="edit-course-description"
          placeholder="Course description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-course-credits">Credits</Label>
        <Input
          id="edit-course-credits"
          type="number"
          placeholder="e.g., 3"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          min="1"
          max="6"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-course-department">Department</Label>
        <Select value={departmentId || undefined} onValueChange={(value) => setDepartmentId(value || "")}>
          <SelectTrigger id="edit-course-department">
            <SelectValue placeholder="Select a department (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-course-status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="edit-course-status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={updateCourse.isPending}
      >
        {updateCourse.isPending ? "Updating..." : "Update Course"}
      </Button>
    </form>
  )
}

export function EditCourseDialog({ course, isOpen, onOpenChange }: EditCourseDialogProps) {
  if (!course) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>Update course information</DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <EditCourseFormContent course={course} onOpenChange={onOpenChange} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}

