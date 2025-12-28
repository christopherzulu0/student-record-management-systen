"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Trash2,
  Edit,
  User,
  GraduationCap,
  TrendingUp,
  Users,
  AlertTriangle,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Award,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAdminStudents, type AdminStudent } from "@/lib/hooks/use-admin-students"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

// Helper function to convert score to letter grade (matches API grading)
const getLetterGrade = (score: number): string => {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

// Helper function to get grade comment
const getGradeComment = (grade: string): string => {
  if (grade.startsWith("A")) return "Excellent"
  if (grade.startsWith("B")) return "Very Good"
  if (grade.startsWith("C")) return "Good"
  if (grade.startsWith("D")) return "Passed"
  if (grade.startsWith("F")) return "Failed"
  return "N/A"
}

export function AdminStudentsContent() {
  const { data } = useAdminStudents()
  const queryClient = useQueryClient()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  // Action states
  const [editingStudent, setEditingStudent] = useState<AdminStudent | null>(null)
  const [viewingProfileStudent, setViewingProfileStudent] = useState<AdminStudent | null>(null)
  const [viewingGradesStudent, setViewingGradesStudent] = useState<AdminStudent | null>(null)
  const [deletingStudent, setDeletingStudent] = useState<AdminStudent | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [studentDetails, setStudentDetails] = useState<any>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    status: "",
    credits: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const filteredStudents = data.students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
      case "at-risk":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
      case "suspended":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
    }
  }

  const getAverageColor = (average: number) => {
    if (average >= 90) return "text-emerald-600 dark:text-emerald-400"
    if (average >= 70) return "text-blue-600 dark:text-blue-400"
    if (average >= 60) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      toast.error("No students to export")
      return
    }

    // Prepare CSV data
    const headers = ["Student ID", "Name", "Email", "Average", "Letter Grade", "Comment", "Credits", "Status", "Enrolled Date"]
    const rows = filteredStudents.map((student) => {
      const letterGrade = getLetterGrade(Math.round(student.average))
      const comment = getGradeComment(letterGrade)
      return [
        student.id,
        student.name,
        student.email,
        student.average.toFixed(2),
        letterGrade,
        comment,
        student.credits.toString(),
        student.status,
        new Date(student.enrolled).toLocaleDateString(),
      ]
    })

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    // Add metadata at the top
    const metadata = [
      `Export Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      `Total Students: ${filteredStudents.length}`,
      `Active: ${data.statistics.active}`,
      `At Risk: ${data.statistics.atRisk}`,
      `Average: ${data.statistics.avgAverage.toFixed(2)}`,
      "",
    ]

    const fullCSV = [...metadata, csvContent].join("\n")

    // Create blob and download
    const blob = new Blob([fullCSV], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `students_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Students exported successfully!")
  }

  const handleViewProfile = async (student: AdminStudent) => {
    setViewingProfileStudent(student)
    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/admin/students/${student.studentModelId}`)
      if (!response.ok) throw new Error("Failed to fetch student details")
      const data = await response.json()
      setStudentDetails(data.student)
    } catch (error) {
      toast.error("Failed to load student profile")
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleViewGrades = async (student: AdminStudent) => {
    setViewingGradesStudent(student)
    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/admin/students/${student.studentModelId}`)
      if (!response.ok) throw new Error("Failed to fetch student details")
      const data = await response.json()
      setStudentDetails(data.student)
    } catch (error) {
      toast.error("Failed to load student grades")
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleEdit = async (student: AdminStudent) => {
    setEditingStudent(student)
    setEditFormData({
      status: student.status,
      credits: student.credits.toString(),
    })

    // Fetch full student details for editing
    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/admin/students/${student.studentModelId}`)
      if (!response.ok) throw new Error("Failed to fetch student details")
      const data = await response.json()
      setStudentDetails(data.student)
      setEditFormData({
        status: data.student.status === "at_risk" ? "at-risk" : data.student.status,
        credits: data.student.credits.toString(),
      })
    } catch (error) {
      toast.error("Failed to load student details")
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/students/${editingStudent.studentModelId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: editFormData.status,
          credits: Number.parseInt(editFormData.credits, 10) || 0,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update student")
      }

      toast.success("Student updated successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-students"] })
      setEditingStudent(null)
      setEditFormData({ status: "", credits: "" })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update student")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingStudent) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/students/${deletingStudent.studentModelId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete student")
      }

      toast.success("Student deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-students"] })
      setDeletingStudent(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete student")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return

    if (
      !confirm(`Are you sure you want to delete ${selectedStudents.length} student(s)? This action cannot be undone.`)
    ) {
      return
    }

    try {
      // Get student model IDs for selected students
      const studentsToDelete = data.students.filter((s) => selectedStudents.includes(s.id))

      await Promise.all(
        studentsToDelete.map((student) =>
          fetch(`/api/admin/students/${student.studentModelId}`, {
            method: "DELETE",
          }),
        ),
      )

      toast.success(`${selectedStudents.length} student(s) deleted successfully`)
      queryClient.invalidateQueries({ queryKey: ["admin-students"] })
      setSelectedStudents([])
    } catch (error) {
      toast.error("Failed to delete some students")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 dark:from-blue-400 dark:via-blue-500 dark:to-indigo-400 bg-clip-text text-transparent">
              Student Management
            </h1>
            <p className="text-base text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Managing {data.statistics.total} student records across all programs
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl">Add New Student</DialogTitle>
                <DialogDescription className="text-base">
                  Register a new student in the system. All fields are required.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-5 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Full Name</Label>
                  <Input placeholder="John Doe" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Email Address</Label>
                  <Input type="email" placeholder="john.doe@university.edu" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Student ID</Label>
                  <Input placeholder="STU001" className="h-11 font-mono" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Initial Credits</Label>
                  <Input type="number" placeholder="0" className="h-11" />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Register Student
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/30 overflow-hidden relative group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <CardHeader className="pb-3 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Students
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                {data.statistics.total}
              </div>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Currently enrolled
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-900 dark:to-emerald-950/30 overflow-hidden relative group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <CardHeader className="pb-3 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Active Students
                </CardTitle>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                {data.statistics.active}
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-2 font-medium">In good standing</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-900 dark:to-orange-950/30 overflow-hidden relative group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <CardHeader className="pb-3 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  At Risk
                </CardTitle>
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                {data.statistics.atRisk}
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-400 mt-2 font-medium">Average below 70</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-900 dark:to-purple-950/30 overflow-hidden relative group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <CardHeader className="pb-3 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Average
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {data.statistics.avgAverage.toFixed(2)}
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-400 mt-2 font-medium">System-wide average</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-xl">Search & Filter</CardTitle>
            </div>
            <CardDescription className="text-base">Find students by name, email, or student ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-12 h-12 text-base bg-white dark:bg-slate-950 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="default"
                onClick={handleExportCSV}
                disabled={filteredStudents.length === 0}
                className="shadow-sm hover:shadow-md transition-all bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              {selectedStudents.length > 0 && (
                <Button
                  variant="destructive"
                  size="default"
                  onClick={handleBulkDelete}
                  className="shadow-sm hover:shadow-md transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {selectedStudents.length} Selected
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student List */}
        <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mb-20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Student Directory</CardTitle>
                <CardDescription className="text-base mt-1">
                  Showing {filteredStudents.length} of {data.statistics.total} students
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-12">
                      <input type="checkbox" className="rounded border" />
                    </TableHead>
                    <TableHead className="font-semibold">Student ID</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Average</TableHead>
                    <TableHead className="font-semibold">Letter Grade</TableHead>
                    <TableHead className="font-semibold">Comment</TableHead>
                    <TableHead className="font-semibold">Credits</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Enrolled</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                      <TableRow
                        key={student.id}
                        className="hover:bg-muted/30 transition-colors"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            className="rounded border"
                            checked={selectedStudents.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents([...selectedStudents, student.id])
                              } else {
                                setSelectedStudents(selectedStudents.filter((id) => id !== student.id))
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                          {student.id}
                        </TableCell>
                        <TableCell className="font-semibold">{student.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{student.email}</TableCell>
                        <TableCell>
                          <span className={`font-bold text-lg ${getAverageColor(student.average)}`}>
                            {student.average.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {getLetterGrade(Math.round(student.average))}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {getGradeComment(getLetterGrade(Math.round(student.average)))}
                        </TableCell>
                        <TableCell className="font-medium">{student.credits}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(student.status)} font-semibold border capitalize`}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(student.enrolled).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleEdit(student)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Student
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewProfile(student)}>
                                <User className="w-4 h-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewGrades(student)}>
                                <GraduationCap className="w-4 h-4 mr-2" />
                                View Grades
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 dark:text-red-400"
                                onClick={() => setDeletingStudent(student)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 rounded-full bg-muted/50">
                            <Search className="w-10 h-10 text-muted-foreground/50" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-lg font-semibold text-foreground">No students found</p>
                            <p className="text-sm text-muted-foreground">
                              {searchTerm ? "Try adjusting your search criteria" : "No students in the system yet"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Student Dialog */}
      <Dialog
        open={!!editingStudent}
          onOpenChange={(open) => {
          if (!open) {
            setEditingStudent(null)
            setEditFormData({ status: "", credits: "" })
            setStudentDetails(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Edit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Edit Student Information
            </DialogTitle>
            <DialogDescription className="text-base">
              Update academic records and status for this student
            </DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <form onSubmit={handleSaveEdit} className="space-y-6 mt-4">
              {/* Read-only info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Student ID</Label>
                  <Input value={editingStudent.id} disabled className="bg-background font-mono font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Full Name</Label>
                  <Input value={editingStudent.name} disabled className="bg-background font-semibold" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email</Label>
                  <Input value={editingStudent.email} disabled className="bg-background" />
                </div>
              </div>

              {/* Editable fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                    required
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="at-risk">At Risk</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-semibold">Credits Earned</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editFormData.credits}
                    onChange={(e) => setEditFormData({ ...editFormData, credits: e.target.value })}
                    placeholder="0"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Additional read-only info if available */}
              {studentDetails && (studentDetails.program || studentDetails.department) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  {studentDetails.program && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Program</Label>
                      <Input value={studentDetails.program} disabled className="bg-background" />
                    </div>
                  )}
                  {studentDetails.department && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Department</Label>
                      <Input value={studentDetails.department} disabled className="bg-background" />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 bg-transparent"
                  onClick={() => {
                    setEditingStudent(null)
                    setEditFormData({ status: "", credits: "" })
                    setStudentDetails(null)
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isSaving || !editFormData.status}
                >
                  {isSaving ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog
        open={!!viewingProfileStudent}
        onOpenChange={(open) => {
          if (!open) {
            setViewingProfileStudent(null)
            setStudentDetails(null)
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Student Profile</DialogTitle>
                <DialogDescription className="text-base">
                  {viewingProfileStudent?.name} ({viewingProfileStudent?.id})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {isLoadingDetails ? (
            <div className="mt-6 space-y-4">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded" />
            </div>
          ) : studentDetails ? (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="mt-4 space-y-6">
                <Card className="border-2 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email</Label>
                      <p className="font-medium text-base">{studentDetails.email}</p>
                    </div>
                    {studentDetails.phone && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          Phone
                        </Label>
                        <p className="font-medium text-base">{studentDetails.phone}</p>
                      </div>
                    )}
                    {studentDetails.dateOfBirth && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Date of Birth
                        </Label>
                        <p className="font-medium text-base">
                          {new Date(studentDetails.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {studentDetails.address && (
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Address
                        </Label>
                        <p className="font-medium text-base">
                          {studentDetails.address}
                          {studentDetails.city && `, ${studentDetails.city}`}
                          {studentDetails.state && `, ${studentDetails.state}`}
                          {studentDetails.zipCode && ` ${studentDetails.zipCode}`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <CardTitle className="text-lg">Academic Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Average</Label>
                      <p className={`font-bold text-2xl ${getAverageColor(studentDetails.average)}`}>
                        {studentDetails.average.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Letter Grade</Label>
                      <p className="font-bold text-2xl">
                        <Badge variant="outline" className="font-mono text-lg">
                          {getLetterGrade(Math.round(studentDetails.average))}
                        </Badge>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Comment</Label>
                      <p className="font-bold text-2xl text-muted-foreground">
                        {getGradeComment(getLetterGrade(Math.round(studentDetails.average)))}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Credits Earned</Label>
                      <p className="font-bold text-2xl">{studentDetails.credits}</p>
                    </div>
                    {studentDetails.program && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          Program
                        </Label>
                        <p className="font-medium text-base">{studentDetails.program}</p>
                      </div>
                    )}
                    {studentDetails.department && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Department</Label>
                        <p className="font-medium text-base">{studentDetails.department}</p>
                      </div>
                    )}
                    {studentDetails.yearOfStudy && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Year of Study</Label>
                        <p className="font-medium text-base">Year {studentDetails.yearOfStudy}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Enrollment Date
                      </Label>
                      <p className="font-medium text-base">
                        {new Date(studentDetails.enrollmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* View Grades Dialog */}
      <Dialog
        open={!!viewingGradesStudent}
        onOpenChange={(open) => {
          if (!open) {
            setViewingGradesStudent(null)
            setStudentDetails(null)
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Student Grades</DialogTitle>
                <DialogDescription className="text-base">
                  {viewingGradesStudent?.name} ({viewingGradesStudent?.id})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {isLoadingDetails ? (
            <div className="mt-6 space-y-4">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded" />
            </div>
          ) : studentDetails ? (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="mt-4 space-y-6">
                <Card className="border-2 shadow-sm bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <CardTitle className="text-lg">Academic Summary</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Overall Average</Label>
                      <p className={`font-bold text-3xl ${getAverageColor(studentDetails.average)}`}>
                        {studentDetails.average.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Total Credits</Label>
                      <p className="font-bold text-3xl text-blue-600 dark:text-blue-400">{studentDetails.credits}</p>
                    </div>
                  </CardContent>
                </Card>

                {studentDetails.grades && studentDetails.grades.length > 0 ? (
                  <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <CardTitle className="text-lg">Course Grades</CardTitle>
                      </div>
                      <CardDescription>{studentDetails.grades.length} courses completed</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {studentDetails.grades.map((grade: any) => (
                          <div
                            key={grade.id}
                            className="border-2 rounded-lg p-4 hover:shadow-md transition-all bg-gradient-to-r from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="space-y-1">
                                <p className="font-bold text-lg">{grade.courseCode}</p>
                                <p className="text-muted-foreground">{grade.courseName}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {grade.semester}
                                </p>
                              </div>
                              <div className="text-right space-y-2">
                                <Badge
                                  className={`text-base px-3 py-1 ${
                                    grade.score >= 90
                                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                      : grade.score >= 80
                                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                                        : grade.score >= 70
                                          ? "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
                                          : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                                  }`}
                                >
                                  {grade.letterGrade}
                                </Badge>
                                <p className="font-bold text-xl">{grade.score}%</p>
                              </div>
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground pt-2 border-t">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {grade.credits} credits
                              </span>
                              {grade.attendance !== null && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {grade.attendance}% attendance
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-2 shadow-sm">
                    <CardContent className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-full bg-muted">
                          <GraduationCap className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">No grades recorded yet</p>
                        <p className="text-sm text-muted-foreground">
                          Grades will appear here once courses are completed
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingStudent} onOpenChange={(open) => !open && setDeletingStudent(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="space-y-3">
            <div className="mx-auto p-3 rounded-full bg-red-500/10">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-2xl text-center">Delete Student?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-center">
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">{deletingStudent?.name}</span> ({deletingStudent?.id}) and
              all associated records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel disabled={isDeleting} className="flex-1">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
