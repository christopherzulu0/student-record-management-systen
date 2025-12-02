"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  BarChart3,
  Search,
  Edit,
  FileText,
  Target,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { useTeacherGrades, useRecordGrade, type StudentGrade } from "@/lib/hooks/use-teacher-grades"
import { toast } from "sonner"

export function TeacherGradesPageContent() {
  const { data } = useTeacherGrades()
  const recordGradeMutation = useRecordGrade()
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    data.courses.length > 0 ? data.courses[0].id : ""
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState<StudentGrade | null>(null)
  const [editGradeValue, setEditGradeValue] = useState<string>("")
  const [editAttendanceValue, setEditAttendanceValue] = useState<string>("")
  const [editTrendValue, setEditTrendValue] = useState<string>("")
  const [editAssignmentType, setEditAssignmentType] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Form state for recording new grade
  const [dialogCourseId, setDialogCourseId] = useState<string>("")
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [gradeValue, setGradeValue] = useState<string>("")
  const [attendanceValue, setAttendanceValue] = useState<string>("")
  const [trendValue, setTrendValue] = useState<string>("stable")
  const [assignmentTypeValue, setAssignmentTypeValue] = useState<string>("")

  // Get current course data
  const currentCourse = data.courses.find(c => c.id === selectedCourseId)
  const currentCourseGrades = selectedCourseId && data.gradesByCourse[selectedCourseId]
    ? data.gradesByCourse[selectedCourseId]
    : null

  const filteredGrades = currentCourseGrades
    ? currentCourseGrades.students.filter(
        (g) => g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.studentId.includes(searchTerm)
      )
    : []

  // Pagination calculations
  const totalPages = Math.ceil(filteredGrades.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const courseGrades = filteredGrades.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleCourseChange = (value: string) => {
    setSelectedCourseId(value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const stats = currentCourseGrades?.statistics || {
    total: 0,
    avgGrade: 0,
    avgAttendance: 0,
    excellentCount: 0,
    needsHelpCount: 0,
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
    if (grade >= 80) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
    if (grade >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
  }

  const getGradeDistribution = () => {
    const excellent = filteredGrades.filter((g) => g.currentGrade >= 90).length
    const good = filteredGrades.filter((g) => g.currentGrade >= 80 && g.currentGrade < 90).length
    const average = filteredGrades.filter((g) => g.currentGrade >= 70 && g.currentGrade < 80).length
    const needsHelp = filteredGrades.filter((g) => g.currentGrade < 70).length
    return { excellent, good, average, needsHelp }
  }

  const distribution = getGradeDistribution()

  const handleExportCSV = () => {
    if (!currentCourse || !currentCourseGrades) {
      toast.error("Please select a course first")
      return
    }

    // Prepare CSV data
    const headers = [
      "Student ID",
      "Name",
      "Grade (%)",
      "Attendance (%)",
      "Trend",
      "Status",
      "Assignment Type",
    ]

    const rows = filteredGrades.map((grade) => {
      let status = ""
      if (grade.currentGrade >= 90) {
        status = "Excellent"
      } else if (grade.currentGrade >= 80) {
        status = "Good"
      } else if (grade.currentGrade >= 70) {
        status = "Average"
      } else {
        status = "Needs Help"
      }

      return [
        grade.studentId,
        grade.name,
        grade.currentGrade.toString(),
        grade.attendance !== null ? grade.attendance.toString() : "N/A",
        grade.trend.charAt(0).toUpperCase() + grade.trend.slice(1),
        status,
        grade.assignmentType || "N/A",
      ]
    })

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    // Add metadata at the top
    const metadata = [
      `Course: ${currentCourse.courseCode} - ${currentCourse.name}`,
      `Export Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      `Total Students: ${filteredGrades.length}`,
      `Average Grade: ${stats.avgGrade}%`,
      `Average Attendance: ${stats.avgAttendance}%`,
      "",
    ]

    const fullCSV = [...metadata, csvContent].join("\n")

    // Create blob and download
    const blob = new Blob([fullCSV], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    
    link.setAttribute("href", url)
    link.setAttribute("download", `${currentCourse.courseCode}_grades_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("Report exported successfully!")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Grades Management
          </h1>
          <p className="text-muted-foreground mt-2">Record, manage, and track student academic performance</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleExportCSV}
            disabled={!currentCourse || !currentCourseGrades || filteredGrades.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Dialog 
            open={isDialogOpen} 
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (open) {
                // Initialize dialog course with current selected course
                setDialogCourseId(selectedCourseId)
                setSelectedStudentId("")
                setGradeValue("")
                setAttendanceValue("")
                setTrendValue("stable")
                setAssignmentTypeValue("")
              } else {
                // Reset form when dialog closes
                setSelectedStudentId("")
                setGradeValue("")
                setAttendanceValue("")
                setTrendValue("stable")
                setAssignmentTypeValue("")
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Record Grade
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 gap-0">
              <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
                <DialogTitle className="text-xl">Record Student Grade</DialogTitle>
                <DialogDescription>Add or update a grade for a student in your course</DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 min-h-0">
                <form
                  id="record-grade-form"
                  className="space-y-4 py-4"
                  onSubmit={async (e) => {
                  e.preventDefault()
                  
                  if (!selectedStudentId || !gradeValue || !dialogCourseId) {
                    toast.error("Please fill in all required fields")
                    return
                  }

                  // Get students for the selected course in dialog
                  const dialogCourseGrades = dialogCourseId && data.gradesByCourse[dialogCourseId]
                    ? data.gradesByCourse[dialogCourseId]
                    : null

                  const selectedStudent = dialogCourseGrades?.students.find(
                    s => s.studentModelId === selectedStudentId || s.id === selectedStudentId
                  )

                  if (!selectedStudent || !selectedStudent.semesterId) {
                    toast.error("Student enrollment information not found")
                    return
                  }

                  try {
                    await recordGradeMutation.mutateAsync({
                      studentId: selectedStudent.studentModelId || selectedStudent.id.replace('pending-', ''),
                      courseId: dialogCourseId,
                      semesterId: selectedStudent.semesterId,
                      score: Number(gradeValue),
                      attendance: attendanceValue && attendanceValue.trim() !== '' 
                        ? Number(attendanceValue) 
                        : null,
                      trend: trendValue as "up" | "down" | "stable",
                      assignmentType: assignmentTypeValue || undefined,
                    })
                    
                    toast.success("Grade recorded successfully")
                    setIsDialogOpen(false)
                    setSelectedStudentId("")
                    setGradeValue("")
                    setAttendanceValue("")
                    setTrendValue("stable")
                    setAssignmentTypeValue("")
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Failed to record grade")
                  }
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="dialog-course" className="text-sm font-medium">
                    Course <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={dialogCourseId} 
                    onValueChange={(value) => {
                      setDialogCourseId(value)
                      // Reset student selection when course changes
                      setSelectedStudentId("")
                    }} 
                    required
                  >
                    <SelectTrigger id="dialog-course">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student" className="text-sm font-medium">
                    Student <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={selectedStudentId} 
                    onValueChange={setSelectedStudentId} 
                    required
                    disabled={!dialogCourseId}
                  >
                    <SelectTrigger id="student">
                      <SelectValue placeholder={dialogCourseId ? "Select student" : "Select course first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {dialogCourseId && data.gradesByCourse[dialogCourseId]?.students.map((g) => (
                        <SelectItem key={g.id} value={g.studentModelId || g.id}>
                          {g.name} ({g.studentId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-sm font-medium">
                    Grade (0-100) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="grade"
                    type="number"
                    placeholder="85"
                    min="0"
                    max="100"
                    value={gradeValue}
                    onChange={(e) => setGradeValue(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendance" className="text-sm font-medium">
                    Attendance (%)
                  </Label>
                  <Input
                    id="attendance"
                    type="number"
                    placeholder="100"
                    min="0"
                    max="100"
                    value={attendanceValue}
                    onChange={(e) => setAttendanceValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trend" className="text-sm font-medium">
                    Performance Trend
                  </Label>
                  <Select value={trendValue} onValueChange={setTrendValue}>
                    <SelectTrigger id="trend">
                      <SelectValue placeholder="Select trend" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="up">Up - Improving</SelectItem>
                      <SelectItem value="stable">Stable - Consistent</SelectItem>
                      <SelectItem value="down">Down - Declining</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Assignment Type
                  </Label>
                  <Select value={assignmentTypeValue} onValueChange={setAssignmentTypeValue}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="midterm">Midterm Exam</SelectItem>
                      <SelectItem value="final">Final Exam</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="participation">Participation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
              </div>
              <div className="flex gap-2 px-6 pb-6 pt-4 border-t flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setDialogCourseId("")
                    setSelectedStudentId("")
                    setGradeValue("")
                    setAttendanceValue("")
                    setTrendValue("stable")
                    setAssignmentTypeValue("")
                  }}
                  disabled={recordGradeMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="record-grade-form"
                  className="flex-1"
                  disabled={recordGradeMutation.isPending}
                >
                  {recordGradeMutation.isPending ? "Saving..." : "Save Grade"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Students Enrolled</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Active students</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Grade</CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                stats.avgGrade >= 90
                  ? "text-green-600 dark:text-green-400"
                  : stats.avgGrade >= 80
                    ? "text-blue-600 dark:text-blue-400"
                    : stats.avgGrade >= 70
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
              }`}
            >
              {stats.avgGrade}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Class average</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Attendance</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.avgAttendance}%</div>
            <Progress value={stats.avgAttendance} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Excellent Students</CardTitle>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.excellentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? Math.round((stats.excellentCount / stats.total) * 100) : 0}% of class
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Select Course</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCourseId} onValueChange={handleCourseChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {data.courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Search Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.needsHelpCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Students below 70%</p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Grade Distribution
          </CardTitle>
          <CardDescription>Overview of student performance across grade ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 dark:text-green-400 font-medium">Excellent (90-100%)</span>
                <span className="font-semibold">{distribution.excellent}</span>
              </div>
              <Progress value={(distribution.excellent / filteredGrades.length) * 100 || 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600 dark:text-blue-400 font-medium">Good (80-89%)</span>
                <span className="font-semibold">{distribution.good}</span>
              </div>
              <Progress value={(distribution.good / filteredGrades.length) * 100 || 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">Average (70-79%)</span>
                <span className="font-semibold">{distribution.average}</span>
              </div>
              <Progress value={(distribution.average / filteredGrades.length) * 100 || 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-600 dark:text-red-400 font-medium">Needs Help (&lt;70%)</span>
                <span className="font-semibold">{distribution.needsHelp}</span>
              </div>
              <Progress value={(distribution.needsHelp / filteredGrades.length) * 100 || 0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Student Grades</CardTitle>
              <CardDescription className="mt-1">
                {filteredGrades.length} students enrolled • Showing {startIndex + 1}-
                {Math.min(endIndex, filteredGrades.length)} of {filteredGrades.length}{" "}
                {currentCourse ? `for ${currentCourse.courseCode}` : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="items-per-page" className="text-sm text-muted-foreground">
                  Per page:
                </Label>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger id="items-per-page" className="w-20 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline" className="gap-1">
                <FileText className="w-3 h-3" />
                {filteredGrades.length} Total
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Student ID</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Grade</TableHead>
                  <TableHead className="font-semibold">Attendance</TableHead>
                  <TableHead className="font-semibold">Trend</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseGrades.length > 0 ? (
                  courseGrades.map((grade) => (
                    <TableRow key={grade.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-sm font-medium">{grade.studentId}</TableCell>
                      <TableCell className="font-medium">{grade.name}</TableCell>
                      <TableCell>
                        <Badge className={getGradeColor(grade.currentGrade)}>
                          {grade.currentGrade}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[100px]">
                            <Progress value={grade.attendance ?? 0} className="h-2" />
                          </div>
                          <span className="text-sm font-medium min-w-[40px]">
                            {grade.attendance !== null ? `${grade.attendance}%` : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`gap-1 ${
                            grade.trend === "up"
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800"
                              : grade.trend === "down"
                                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800"
                                : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-200 dark:border-gray-800"
                          }`}
                        >
                          {grade.trend === "up" ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : grade.trend === "down" ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : (
                            <BarChart3 className="w-3 h-3" />
                          )}
                          {grade.trend.charAt(0).toUpperCase() + grade.trend.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {grade.currentGrade >= 90 ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Excellent
                          </Badge>
                        ) : grade.currentGrade >= 80 ? (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 gap-1">
                            <Award className="w-3 h-3" />
                            Good
                          </Badge>
                        ) : grade.currentGrade >= 70 ? (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 gap-1">
                            <Target className="w-3 h-3" />
                            Average
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Needs Help
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            setEditingGrade(grade)
                            setEditGradeValue(grade.currentGrade.toString())
                            setEditAttendanceValue(grade.attendance !== null ? grade.attendance.toString() : "")
                            setEditTrendValue(grade.trend)
                            setEditAssignmentType(grade.assignmentType || "")
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-12 h-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground font-medium">No students found</p>
                        <p className="text-sm text-muted-foreground">
                          {currentCourseGrades
                            ? "Try adjusting your search criteria"
                            : "No students enrolled in this course yet"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          {filteredGrades.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredGrades.length)} of {filteredGrades.length}{" "}
                results
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setCurrentPage(page)
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    return null
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Grade Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
            <DialogTitle className="text-xl">Edit Student Grade</DialogTitle>
            <DialogDescription>
              Update grade for {editingGrade?.name} ({editingGrade?.studentId})
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 min-h-0">
            <form
              id="edit-grade-form"
              className="space-y-4 py-4"
              onSubmit={async (e) => {
              e.preventDefault()
              
              if (!editingGrade || !editGradeValue || !selectedCourseId) {
                toast.error("Please fill in all required fields")
                return
              }

              if (!editingGrade.semesterId) {
                toast.error("Student enrollment information not found")
                return
              }

              try {
                await recordGradeMutation.mutateAsync({
                  studentId: editingGrade.studentModelId || editingGrade.id.replace('pending-', ''),
                  courseId: selectedCourseId,
                  semesterId: editingGrade.semesterId,
                  score: Number(editGradeValue),
                  attendance: editAttendanceValue && editAttendanceValue.trim() !== '' 
                    ? Number(editAttendanceValue) 
                    : null,
                  trend: editTrendValue as "up" | "down" | "stable",
                  assignmentType: editAssignmentType || undefined,
                })
                
                toast.success("Grade updated successfully")
                setIsEditDialogOpen(false)
                setEditingGrade(null)
                setEditGradeValue("")
                setEditAttendanceValue("")
                setEditTrendValue("")
                setEditAssignmentType("")
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to update grade")
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="edit-student" className="text-sm font-medium">
                Student
              </Label>
              <Input
                id="edit-student"
                value={editingGrade ? `${editingGrade.name} (${editingGrade.studentId})` : ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-grade" className="text-sm font-medium">
                Grade (0-100)
              </Label>
              <Input
                id="edit-grade"
                type="number"
                placeholder="85"
                min="0"
                max="100"
                value={editGradeValue}
                onChange={(e) => setEditGradeValue(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-attendance" className="text-sm font-medium">
                Attendance (%)
              </Label>
              <Input
                id="edit-attendance"
                type="number"
                placeholder="Enter attendance percentage"
                min="0"
                max="100"
                value={editAttendanceValue}
                onChange={(e) => setEditAttendanceValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-trend" className="text-sm font-medium">
                Performance Trend
              </Label>
              <Select value={editTrendValue} onValueChange={setEditTrendValue}>
                <SelectTrigger id="edit-trend">
                  <SelectValue placeholder="Select trend" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="up">Up - Improving</SelectItem>
                  <SelectItem value="stable">Stable - Consistent</SelectItem>
                  <SelectItem value="down">Down - Declining</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type" className="text-sm font-medium">
                Assignment Type
              </Label>
              <Select value={editAssignmentType} onValueChange={setEditAssignmentType}>
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midterm">Midterm Exam</SelectItem>
                  <SelectItem value="final">Final Exam</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="participation">Participation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
          </div>
          <div className="flex gap-2 px-6 pb-6 pt-4 border-t flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingGrade(null)
                setEditGradeValue("")
                setEditAttendanceValue("")
                setEditTrendValue("")
                setEditAssignmentType("")
              }}
              disabled={recordGradeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-grade-form"
              className="flex-1"
              disabled={recordGradeMutation.isPending}
            >
              {recordGradeMutation.isPending ? "Updating..." : "Update Grade"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

