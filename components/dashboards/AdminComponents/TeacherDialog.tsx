'use client'

import React, { useState, Suspense, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserCheck, Loader2, X } from "lucide-react"

import { useCourses } from "@/lib/hooks/use-courses"
import { useSemesters } from "@/lib/hooks/use-semesters"
import { toast } from "sonner"
import { useTeachers } from "@/lib/hooks/use-teachers-assign"

function AssignTeacherFormContent({ onSuccess }: { onSuccess: () => void }) {
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [existingTeachers, setExistingTeachers] = useState<Array<{ id: string; name: string; email: string; department: string | null }>>([])
  
  const { data: teachers } = useTeachers()
  const { data: courses } = useCourses()
  const { data: semesters } = useSemesters()

  // Fetch existing teachers when course is selected
  useEffect(() => {
    if (selectedCourse) {
      setIsLoading(true)
      fetch(`/api/courses/${selectedCourse}/teachers`, {
        credentials: "include",
      })
        .then(res => res.json())
        .then(data => {
          if (data.teachers) {
            setExistingTeachers(data.teachers)
            setSelectedTeacherIds(data.teachers.map((t: any) => t.id))
          } else {
            setExistingTeachers([])
            setSelectedTeacherIds([])
          }
        })
        .catch(() => {
          setExistingTeachers([])
          setSelectedTeacherIds([])
        })
        .finally(() => setIsLoading(false))
    } else {
      setExistingTeachers([])
      setSelectedTeacherIds([])
    }
  }, [selectedCourse])

  const handleTeacherToggle = (teacherId: string) => {
    setSelectedTeacherIds(prev => 
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    )
  }

  const handleSelectAll = () => {
    if (selectedTeacherIds.length === teachers.length) {
      setSelectedTeacherIds([])
    } else {
      setSelectedTeacherIds(teachers.map(t => t.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCourse) {
      toast.error("Please select a course")
      return
    }

    if (selectedTeacherIds.length === 0) {
      toast.error("Please select at least one teacher")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/courses/${selectedCourse}/teachers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          teacherIds: selectedTeacherIds,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to assign teachers")
      }

      const result = await response.json()
      toast.success(result.message || `Successfully assigned ${selectedTeacherIds.length} teacher(s) to course`)
      
      // Reset form
      setSelectedCourse("")
      setSelectedTeacherIds([])
      setExistingTeachers([])
      
      // Close dialog
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to assign teachers")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-4">
      <div className="space-y-2">
        <Label htmlFor="select-course">Course *</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={isLoading}>
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

      {selectedCourse && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Select Teachers *</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-7 text-xs"
            >
              {selectedTeacherIds.length === teachers.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
          <ScrollArea className="h-[250px] border rounded-lg p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : teachers.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No teachers available
              </div>
            ) : (
              <div className="space-y-3">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <Checkbox
                      id={`teacher-${teacher.id}`}
                      checked={selectedTeacherIds.includes(teacher.id)}
                      onCheckedChange={() => handleTeacherToggle(teacher.id)}
                    />
                    <Label
                      htmlFor={`teacher-${teacher.id}`}
                      className="flex-1 cursor-pointer text-sm font-normal"
                    >
                      <div className="font-medium">{teacher.name}</div>
                      {teacher.department && (
                        <div className="text-xs text-muted-foreground">{teacher.department}</div>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <p className="text-xs text-muted-foreground">
            {selectedTeacherIds.length > 0 
              ? `${selectedTeacherIds.length} teacher(s) selected`
              : "Select one or more teachers to assign to this course"}
          </p>
        </div>
      )}

      {existingTeachers.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Currently Assigned Teachers</Label>
          <div className="flex flex-wrap gap-2">
            {existingTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
              >
                <span>{teacher.name}</span>
                {teacher.department && (
                  <span className="text-muted-foreground">({teacher.department})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 border-t sticky bottom-0 bg-background">
        <Button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={isLoading || !selectedCourse || selectedTeacherIds.length === 0}
        >
          {isLoading ? "Assigning..." : `Assign ${selectedTeacherIds.length} Teacher(s)`}
        </Button>
      </div>
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <DialogTitle>Assign Teachers to Course</DialogTitle>
          <DialogDescription>Assign one or more teachers to teach a specific course</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <AssignTeacherFormContent onSuccess={() => setIsAssignTeacherOpen(false)} />
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  )
}