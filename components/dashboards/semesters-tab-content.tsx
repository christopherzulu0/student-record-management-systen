"use client"

import { Suspense, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Edit2, Trash2 } from "lucide-react"
import { useSemesters, useDeleteSemester, type Semester } from "@/lib/hooks/use-semesters"
import { SemestersTabSkeleton } from "@/components/semesters-tab-skeleton"
import { format } from "date-fns"
import { EditSemesterDialog } from "./AdminComponents/EditSemesterDialog"
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

function SemestersList() {
  const { data: semesters } = useSemesters()
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deletingSemester, setDeletingSemester] = useState<Semester | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const deleteSemester = useDeleteSemester()

  const handleEdit = (semester: Semester) => {
    setEditingSemester(semester)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (semester: Semester) => {
    setDeletingSemester(semester)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingSemester) return

    try {
      await deleteSemester.mutateAsync(deletingSemester.id)
      toast.success("Semester deleted successfully")
      setIsDeleteDialogOpen(false)
      setDeletingSemester(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete semester")
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          Active
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
        Inactive
      </Badge>
    )
  }

  if (semesters.length === 0) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Semester Management</CardTitle>
              <CardDescription>Create and manage academic semesters</CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No semesters found. Create your first semester to get started.</p>
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
            <CardTitle className="text-lg">Semester Management</CardTitle>
            <CardDescription>Create and manage academic semesters</CardDescription>
          </div>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {semesters.map((semester) => (
            <Card key={semester.id} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{semester.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {formatDate(semester.startDate)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(semester.isActive)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">
                      {formatDate(semester.startDate)} to {formatDate(semester.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">
                      Created {formatDate(semester.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 pt-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 bg-transparent"
                    onClick={() => handleEdit(semester)}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="flex-1"
                    onClick={() => handleDelete(semester)}
                  >
                    <Trash2 className="h-3 w-3 mr-1 text-red-500" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <EditSemesterDialog
        semester={editingSemester}
        isOpen={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditingSemester(null)
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the semester
              {deletingSemester && ` "${deletingSemester.name}"`}. 
              {deletingSemester?.isActive && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                  Warning: This is currently the active semester.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingSemester(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteSemester.isPending}
            >
              {deleteSemester.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export function SemestersTabContent() {
  return (
    <Suspense fallback={<SemestersTabSkeleton />}>
      <SemestersList />
    </Suspense>
  )
}

