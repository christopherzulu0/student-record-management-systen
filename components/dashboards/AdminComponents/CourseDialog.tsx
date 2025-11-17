'use client'
import React, { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { useCreateCourse } from "@/lib/hooks/use-courses"
import { useDepartments } from "@/lib/hooks/use-departments"
import { toast } from "sonner"

function CourseFormContent({ onSuccess }: { onSuccess: () => void }) {
  const [courseCode, setCourseCode] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [credits, setCredits] = useState("3")
  const [departmentId, setDepartmentId] = useState("")
  const [courseCodeError, setCourseCodeError] = useState("")
  
  const createCourse = useCreateCourse()
  const { data: departments } = useDepartments()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCourseCodeError("") // Clear previous errors

    // Validate required fields
    if (!courseCode.trim() || !name.trim()) {
      toast.error("Course code and name are required")
      return
    }

    try {
      await createCourse.mutateAsync({
        courseCode: courseCode.trim(),
        name: name.trim(),
        description: description.trim() || null,
        credits: credits ? parseInt(credits) : 3,
        departmentId: departmentId && departmentId !== "__none__" ? departmentId : undefined,
      })
      
      toast.success("Course created successfully")
      
      // Reset form
      setCourseCode("")
      setName("")
      setDescription("")
      setCredits("3")
      setDepartmentId("")
      setCourseCodeError("")
      
      // Close dialog
      onSuccess()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create course"
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
        <Label htmlFor="course-code">Course Code *</Label>
        <Input
          id="course-code"
          placeholder="e.g., CS102"
          value={courseCode}
          onChange={(e) => {
            setCourseCode(e.target.value)
            setCourseCodeError("") // Clear error when user types
          }}
          className={courseCodeError ? "border-destructive" : ""}
          required
        />
        {courseCodeError && (
          <p className="text-sm text-destructive">{courseCodeError}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="course-name">Course Name *</Label>
        <Input
          id="course-name"
          placeholder="e.g., Advanced Web Development"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="course-description">Description</Label>
        <Textarea
          id="course-description"
          placeholder="Course description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="course-credits">Credits</Label>
        <Input
          id="course-credits"
          type="number"
          placeholder="e.g., 3"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          min="1"
          max="6"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="course-department">Department</Label>
        <Select value={departmentId || undefined} onValueChange={(value) => setDepartmentId(value || "")}>
          <SelectTrigger id="course-department">
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
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={createCourse.isPending}
      >
        {createCourse.isPending ? "Creating..." : "Create Course"}
      </Button>
    </form>
  )
}

export default function CourseDialog() {
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setIsAddCourseOpen(open)
  }

  return (
    <Dialog open={isAddCourseOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>Create a new course for the university</DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <CourseFormContent onSuccess={() => setIsAddCourseOpen(false)} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}