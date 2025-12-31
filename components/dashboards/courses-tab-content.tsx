"use client"

import { Suspense, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Activity, Edit2, Trash2, BookOpen, UserCheck } from "lucide-react"
import { useCourses, useDeleteCourse, type Course } from "@/lib/hooks/use-courses"
import { CoursesTabSkeleton } from "@/components/courses-tab-skeleton"
import { EditCourseDialog } from "./AdminComponents/EditCourseDialog"
import { AssignGradeRecordingDialog } from "./AdminComponents/AssignGradeRecordingDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

function CoursesList() {
  const { data: courses } = useCourses()
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [assigningGradeRecordingCourse, setAssigningGradeRecordingCourse] = useState<Course | null>(null)
  const [isAssignGradeRecordingDialogOpen, setIsAssignGradeRecordingDialogOpen] = useState(false)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const deleteCourse = useDeleteCourse()

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (course: Course) => {
    setDeletingCourse(course)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingCourse) return

    try {
      await deleteCourse.mutateAsync(deletingCourse.id)
      toast.success("Course deleted successfully")
      setIsDeleteDialogOpen(false)
      setDeletingCourse(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete course")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
            Inactive
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            Completed
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
            {status}
          </Badge>
        )
    }
  }

  if (courses.length === 0) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Course Management</CardTitle>
              <CardDescription>Manage courses and teacher assignments</CardDescription>
            </div>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No courses found. Create your first course to get started.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Course Management</CardTitle>
            <CardDescription>Manage courses and teacher assignments</CardDescription>
          </div>
          <BookOpen className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="pt-1">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    {course.courseCode}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{course.name}</p>
                  {course.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{course.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {course.teachers && course.teachers.length > 0 && (
                      <>
                        <span className="text-xs text-muted-foreground">
                          Instructor{course.teachers.length > 1 ? 's' : ''}: {course.teachers.join(', ')}
                          {course.teachers.length > 1 && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              {course.teachers.length}
                            </Badge>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                      </>
                    )}
                    {course.gradeRecordingTeacher && (
                      <>
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-200 border-green-200 dark:border-green-800">
                          Grade Recorder: {course.gradeRecordingTeacher}
                        </Badge>
                        <span className="text-xs text-muted-foreground">•</span>
                      </>
                    )}
                    {course.departmentName && (
                      <>
                        <span className="text-xs text-muted-foreground">{course.departmentName}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                      </>
                    )}
                    <Activity className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{course.enrolledStudents} enrolled</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{course.credits} credits</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(course.status)}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0"
                  title="Assign Grade Recording Teacher"
                  onClick={() => {
                    setAssigningGradeRecordingCourse(course)
                    setIsAssignGradeRecordingDialogOpen(true)
                  }}
                >
                  <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0"
                  title="Edit Course"
                  onClick={() => handleEdit(course)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0"
                  title="Delete Course"
                  onClick={() => handleDelete(course)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <EditCourseDialog
        course={editingCourse}
        isOpen={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditingCourse(null)
          }
        }}
      />

      {/* Assign Grade Recording Teacher Dialog */}
      <AssignGradeRecordingDialog
        course={assigningGradeRecordingCourse}
        isOpen={isAssignGradeRecordingDialogOpen}
        onOpenChange={(open) => {
          setIsAssignGradeRecordingDialogOpen(open)
          if (!open) {
            setAssigningGradeRecordingCourse(null)
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course
              {deletingCourse && ` "${deletingCourse.courseCode} - ${deletingCourse.name}"`}.
              {deletingCourse && deletingCourse.enrolledStudents > 0 && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                  Warning: This course has {deletingCourse.enrolledStudents} enrolled student(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCourse(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteCourse.isPending}
            >
              {deleteCourse.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export function CoursesTabContent() {
  return (
    <Suspense fallback={<CoursesTabSkeleton />}>
      <CoursesList />
    </Suspense>
  )
}

