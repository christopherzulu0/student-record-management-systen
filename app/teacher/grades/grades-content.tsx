"use client"

import { useState, useEffect } from "react"
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
  BookOpen,
  Save,
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
import { useTeacherGrades, useRecordGrade, useBulkRecordGrades, type StudentGrade } from "@/lib/hooks/use-teacher-grades"
import { useSemesters } from "@/lib/hooks/use-semesters"
import { toast } from "sonner"

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

export function TeacherGradesPageContent() {
  const { data } = useTeacherGrades()
  const { data: semesters } = useSemesters()
  const recordGradeMutation = useRecordGrade()
  const bulkRecordGradesMutation = useBulkRecordGrades()
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    data.courses.length > 0 ? data.courses[0].id : ""
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewAllGradesDialogOpen, setIsViewAllGradesDialogOpen] = useState(false)
  const [isBulkRecordDialogOpen, setIsBulkRecordDialogOpen] = useState(false)
  const [selectedStudentForAllGrades, setSelectedStudentForAllGrades] = useState<StudentGrade | null>(null)
  const [allGradesEdits, setAllGradesEdits] = useState<Record<string, {
    grade: string
    attendance: string
    trend: string
    assignmentType: string
  }>>({})
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

  // Form state for bulk recording grades
  const [bulkCourseId, setBulkCourseId] = useState<string>("")
  const [bulkSemesterId, setBulkSemesterId] = useState<string>("")
  const [bulkDefaultScore, setBulkDefaultScore] = useState<string>("")
  const [bulkDefaultAttendance, setBulkDefaultAttendance] = useState<string>("")
  const [bulkDefaultTrend, setBulkDefaultTrend] = useState<string>("stable")
  const [bulkDefaultAssignmentType, setBulkDefaultAssignmentType] = useState<string>("")
  const [bulkStudents, setBulkStudents] = useState<Array<{
    studentId: string
    studentDisplayId: string
    name: string
    email: string
    existingGrade: { score: number; attendance: number | null; trend: string | null; assignmentType: string | null } | null
    grade: string
    attendance: string
    trend: string
    assignmentType: string
  }>>([])
  const [isLoadingBulkStudents, setIsLoadingBulkStudents] = useState(false)
  const [canRecordGrades, setCanRecordGrades] = useState<Record<string, boolean>>({})
  const [gradePermissionError, setGradePermissionError] = useState<Record<string, string>>({})
  const [isCheckingPermission, setIsCheckingPermission] = useState<Record<string, boolean>>({})

  // Check permission for initially selected course
  useEffect(() => {
    if (selectedCourseId) {
      checkGradePermission(selectedCourseId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId])

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

  // Check grade recording permission for a course
  const checkGradePermission = async (courseId: string) => {
    if (!courseId) {
      setCanRecordGrades(prev => ({ ...prev, [courseId]: false }))
      return
    }

    setIsCheckingPermission(prev => ({ ...prev, [courseId]: true }))
    try {
      const response = await fetch(
        `/api/teacher/grades/check-permission?courseId=${courseId}`,
        { credentials: "include" }
      )
      
      if (!response.ok) {
        // Handle non-200 responses
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        setCanRecordGrades(prev => ({ ...prev, [courseId]: false }))
        setGradePermissionError(prev => ({ 
          ...prev, 
          [courseId]: errorData.details || errorData.error || "Failed to check permission. Please try again."
        }))
        return
      }
      
      const data = await response.json()
      
      setCanRecordGrades(prev => ({ ...prev, [courseId]: data.hasPermission || false }))
      setGradePermissionError(prev => ({ 
        ...prev, 
        [courseId]: data.hasPermission ? "" : (data.details || data.error || "You do not have permission to record grades for this course")
      }))
    } catch (error) {
      console.error("Error checking grade permission:", error)
      setCanRecordGrades(prev => ({ ...prev, [courseId]: false }))
      setGradePermissionError(prev => ({ 
        ...prev, 
        [courseId]: "Failed to check permission. Please refresh the page and try again."
      }))
    } finally {
      setIsCheckingPermission(prev => ({ ...prev, [courseId]: false }))
    }
  }

  const handleCourseChange = (value: string) => {
    setSelectedCourseId(value)
    setCurrentPage(1)
    checkGradePermission(value)
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
            open={isBulkRecordDialogOpen}
            onOpenChange={(open) => {
              setIsBulkRecordDialogOpen(open)
              if (open) {
                setBulkCourseId(selectedCourseId)
                setBulkSemesterId("")
                setBulkDefaultScore("")
                setBulkDefaultAttendance("")
                setBulkDefaultTrend("stable")
                setBulkDefaultAssignmentType("")
                setBulkStudents([])
                if (selectedCourseId) {
                  checkGradePermission(selectedCourseId)
                }
              } else {
                setBulkStudents([])
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                Bulk Record Grades
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 gap-0">
              <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
                <DialogTitle className="text-xl">Bulk Record Grades</DialogTitle>
                <DialogDescription>Record grades for all students enrolled in the selected course</DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 min-h-0">
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bulk-course" className="text-sm font-medium">
                        Course <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={bulkCourseId} 
                        onValueChange={(value) => {
                          setBulkCourseId(value)
                          setBulkStudents([])
                          setBulkSemesterId("")
                          if (value) {
                            checkGradePermission(value)
                          }
                        }} 
                      >
                        <SelectTrigger id="bulk-course">
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
                      <Label htmlFor="bulk-semester" className="text-sm font-medium">
                        Semester <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={bulkSemesterId} 
                        onValueChange={async (value) => {
                          setBulkSemesterId(value)
                          if (bulkCourseId && value) {
                            setIsLoadingBulkStudents(true)
                            try {
                              const response = await fetch(
                                `/api/teacher/grades/enrolled-students?courseId=${bulkCourseId}&semesterId=${value}`,
                                { credentials: "include" }
                              )
                              if (response.ok) {
                                const data = await response.json()
                                setBulkStudents(
                                  data.students.map((s: any) => ({
                                    ...s,
                                    grade: s.existingGrade?.score?.toString() || "",
                                    attendance: s.existingGrade?.attendance?.toString() || "",
                                    trend: s.existingGrade?.trend || "stable",
                                    assignmentType: s.existingGrade?.assignmentType || "",
                                  }))
                                )
                              } else {
                                toast.error("Failed to load students")
                              }
                            } catch (error) {
                              toast.error("Failed to load students")
                            } finally {
                              setIsLoadingBulkStudents(false)
                            }
                          }
                        }} 
                        disabled={!bulkCourseId || !canRecordGrades[bulkCourseId] || isCheckingPermission[bulkCourseId]}
                      >
                        <SelectTrigger id="bulk-semester">
                          <SelectValue placeholder={bulkCourseId ? "Select semester" : "Select course first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map((semester) => (
                            <SelectItem key={semester.id} value={semester.id}>
                              {semester.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {bulkCourseId && (
                    <div className="space-y-4">
                      {!canRecordGrades[bulkCourseId] && gradePermissionError[bulkCourseId] && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                Permission Denied
                              </p>
                              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                {gradePermissionError[bulkCourseId]}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {bulkCourseId && bulkSemesterId && (
                        <>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-medium">Students ({bulkStudents.length})</h3>
                              <p className="text-xs text-muted-foreground">Enter individual grades for each student</p>
                            </div>
                        <div className="flex gap-2">
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              placeholder="Grade"
                              className="w-20 h-8"
                              value={bulkDefaultScore}
                              onChange={(e) => setBulkDefaultScore(e.target.value)}
                              disabled={!canRecordGrades[bulkCourseId] || isCheckingPermission[bulkCourseId]}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setBulkStudents(prev => prev.map(s => ({
                                  ...s,
                                  grade: bulkDefaultScore || s.grade,
                                })))
                              }}
                              disabled={!bulkDefaultScore || !canRecordGrades[bulkCourseId] || isCheckingPermission[bulkCourseId]}
                            >
                              Apply to All
                            </Button>
                          </div>
                        </div>
                      </div>

                      {isLoadingBulkStudents ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-sm text-muted-foreground">Loading students...</div>
                        </div>
                      ) : bulkStudents.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No students enrolled in this course for the selected semester
                        </div>
                      ) : (
                        <ScrollArea className="h-[400px] border rounded-lg p-4">
                          <div className="space-y-3">
                            {bulkStudents.map((student, index) => (
                              <Card key={student.studentId} className="p-3">
                                <div className="grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-3">
                                    <div className="text-sm font-medium">{student.name}</div>
                                    <div className="text-xs text-muted-foreground">{student.studentDisplayId}</div>
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-xs">Grade</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      placeholder="0-100"
                                      value={student.grade}
                                      onChange={(e) => {
                                        setBulkStudents(prev => prev.map((s, i) => 
                                          i === index ? { ...s, grade: e.target.value } : s
                                        ))
                                      }}
                                      className="h-8"
                                      disabled={!canRecordGrades[bulkCourseId] || isCheckingPermission[bulkCourseId]}
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-xs">Attendance</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      placeholder="%"
                                      value={student.attendance}
                                      onChange={(e) => {
                                        setBulkStudents(prev => prev.map((s, i) => 
                                          i === index ? { ...s, attendance: e.target.value } : s
                                        ))
                                      }}
                                      className="h-8"
                                      disabled={!canRecordGrades[bulkCourseId] || isCheckingPermission[bulkCourseId]}
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-xs">Trend</Label>
                                    <Select
                                      value={student.trend}
                                      onValueChange={(value) => {
                                        setBulkStudents(prev => prev.map((s, i) => 
                                          i === index ? { ...s, trend: value } : s
                                        ))
                                      }}
                                      disabled={!canRecordGrades[bulkCourseId] || isCheckingPermission[bulkCourseId]}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="up">Up</SelectItem>
                                        <SelectItem value="stable">Stable</SelectItem>
                                        <SelectItem value="down">Down</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-3">
                                    <Label className="text-xs">Assignment Type</Label>
                                    <Select
                                      value={student.assignmentType}
                                      onValueChange={(value) => {
                                        setBulkStudents(prev => prev.map((s, i) => 
                                          i === index ? { ...s, assignmentType: value } : s
                                        ))
                                      }}
                                      disabled={!canRecordGrades[bulkCourseId] || isCheckingPermission[bulkCourseId]}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="midterm">Midterm</SelectItem>
                                        <SelectItem value="final">Final</SelectItem>
                                        <SelectItem value="assignment">Assignment</SelectItem>
                                        <SelectItem value="project">Project</SelectItem>
                                        <SelectItem value="participation">Participation</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 px-6 pb-6 pt-4 border-t flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsBulkRecordDialogOpen(false)
                    setBulkCourseId("")
                    setBulkSemesterId("")
                    setBulkDefaultScore("")
                    setBulkDefaultAttendance("")
                    setBulkDefaultTrend("stable")
                    setBulkDefaultAssignmentType("")
                    setBulkStudents([])
                  }}
                  disabled={bulkRecordGradesMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={
                    bulkRecordGradesMutation.isPending || 
                    bulkStudents.length === 0 || 
                    !canRecordGrades[bulkCourseId] || 
                    isCheckingPermission[bulkCourseId]
                  }
                  onClick={async () => {
                    if (!bulkCourseId || !bulkSemesterId) {
                      toast.error("Please select course and semester")
                      return
                    }

                    if (!canRecordGrades[bulkCourseId]) {
                      toast.error(gradePermissionError[bulkCourseId] || "You do not have permission to record grades for this course")
                      return
                    }

                    const validStudents = bulkStudents.filter(s => s.grade && s.grade.trim() !== "")
                    if (validStudents.length === 0) {
                      toast.error("Please enter at least one grade")
                      return
                    }

                    try {
                      const result = await bulkRecordGradesMutation.mutateAsync({
                        courseId: bulkCourseId,
                        semesterId: bulkSemesterId,
                        studentGrades: validStudents.map(s => ({
                          studentId: s.studentId,
                          score: Number(s.grade),
                          attendance: s.attendance && s.attendance.trim() !== '' ? Number(s.attendance) : null,
                          trend: s.trend as "up" | "down" | "stable",
                          assignmentType: s.assignmentType || undefined,
                        })),
                      })
                      
                      toast.success(
                        result.errors && result.errors.length > 0
                          ? `Recorded grades for ${result.successful} of ${result.total} students. ${result.failed} failed.`
                          : `Successfully recorded grades for all ${result.total} students`
                      )
                      
                      if (result.errors && result.errors.length > 0) {
                        console.error("Grade recording errors:", result.errors)
                      }
                      
                      setIsBulkRecordDialogOpen(false)
                      setBulkCourseId("")
                      setBulkSemesterId("")
                      setBulkDefaultScore("")
                      setBulkDefaultAttendance("")
                      setBulkDefaultTrend("stable")
                      setBulkDefaultAssignmentType("")
                      setBulkStudents([])
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Failed to bulk record grades")
                    }
                  }}
                >
                  {isCheckingPermission[bulkCourseId] 
                    ? "Checking permission..." 
                    : bulkRecordGradesMutation.isPending 
                      ? "Recording..." 
                      : !canRecordGrades[bulkCourseId]
                        ? "No Permission"
                        : `Record ${bulkStudents.filter(s => s.grade && s.grade.trim() !== "").length} Grades`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                if (selectedCourseId) {
                  checkGradePermission(selectedCourseId)
                }
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

                  if (!canRecordGrades[dialogCourseId]) {
                    toast.error(gradePermissionError[dialogCourseId] || "You do not have permission to record grades for this course")
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
                      if (value) {
                        checkGradePermission(value)
                      }
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
                {dialogCourseId && !canRecordGrades[dialogCourseId] && gradePermissionError[dialogCourseId] && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          Permission Denied
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                          {gradePermissionError[dialogCourseId]}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                    disabled={dialogCourseId ? !canRecordGrades[dialogCourseId] : false}
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
                  disabled={
                    recordGradeMutation.isPending || 
                    (dialogCourseId ? (!canRecordGrades[dialogCourseId] || isCheckingPermission[dialogCourseId]) : false)
                  }
                >
                  {isCheckingPermission[dialogCourseId] 
                    ? "Checking permission..." 
                    : recordGradeMutation.isPending 
                      ? "Saving..." 
                      : dialogCourseId && !canRecordGrades[dialogCourseId]
                        ? "No Permission"
                        : "Save Grade"}
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
      <Card className="mb-20">
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
                  <TableHead className="font-semibold">Letter Grade</TableHead>
                  <TableHead className="font-semibold">Comment</TableHead>
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
                        <Badge variant="outline" className="font-mono">
                          {getLetterGrade(grade.currentGrade)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getGradeComment(getLetterGrade(grade.currentGrade))}
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
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => {
                              setSelectedStudentForAllGrades(grade)
                              setIsViewAllGradesDialogOpen(true)
                            }}
                          >
                            <BookOpen className="w-3 h-3" />
                            All Grades
                          </Button>
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
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

      {/* View All Grades Dialog */}
      <Dialog 
        open={isViewAllGradesDialogOpen} 
        onOpenChange={(open) => {
          setIsViewAllGradesDialogOpen(open)
          if (open && selectedStudentForAllGrades) {
            // Initialize edit state when dialog opens
            const initialEdits: Record<string, {
              grade: string
              attendance: string
              trend: string
              assignmentType: string
            }> = {}
            
            data.courses.forEach((course) => {
              const courseGrades = data.gradesByCourse[course.id]
              const studentGrade = courseGrades?.students.find(
                (g) => g.studentId === selectedStudentForAllGrades.studentId
              )
              
              if (studentGrade) {
                initialEdits[course.id] = {
                  grade: studentGrade.currentGrade.toString(),
                  attendance: studentGrade.attendance !== null ? studentGrade.attendance.toString() : "",
                  trend: studentGrade.trend,
                  assignmentType: studentGrade.assignmentType || "",
                }
              }
            })
            
            setAllGradesEdits(initialEdits)
          } else {
            setAllGradesEdits({})
            setSelectedStudentForAllGrades(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
            <DialogTitle className="text-xl">
              All Grades for {selectedStudentForAllGrades?.name}
            </DialogTitle>
            <DialogDescription>
              Student ID: {selectedStudentForAllGrades?.studentId} • View and edit all grades across all courses
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 min-h-0">
            {selectedStudentForAllGrades && (
              <div className="space-y-4 py-4">
                {data.courses.map((course) => {
                  const courseGrades = data.gradesByCourse[course.id]
                  const studentGrade = courseGrades?.students.find(
                    (g) => g.studentId === selectedStudentForAllGrades.studentId
                  )
                  
                  if (!studentGrade) return null

                  const courseEdit = allGradesEdits[course.id] || {
                    grade: studentGrade.currentGrade.toString(),
                    attendance: studentGrade.attendance !== null ? studentGrade.attendance.toString() : "",
                    trend: studentGrade.trend,
                    assignmentType: studentGrade.assignmentType || "",
                  }

                  return (
                    <Card key={course.id} className="border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{course.displayName}</CardTitle>
                        <CardDescription>
                          Semester: {studentGrade.semesterName || "N/A"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`grade-${course.id}`} className="text-sm font-medium">
                              Grade (0-100)
                            </Label>
                            <Input
                              id={`grade-${course.id}`}
                              type="number"
                              min="0"
                              max="100"
                              value={courseEdit.grade}
                              onChange={(e) => {
                                setAllGradesEdits(prev => ({
                                  ...prev,
                                  [course.id]: {
                                    ...(prev[course.id] || courseEdit),
                                    grade: e.target.value,
                                  }
                                }))
                              }}
                              className="w-full"
                            />
                            {courseEdit.grade && Number(courseEdit.grade) > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="font-mono">
                                  {getLetterGrade(Number(courseEdit.grade))}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {getGradeComment(getLetterGrade(Number(courseEdit.grade)))}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`attendance-${course.id}`} className="text-sm font-medium">
                              Attendance (%)
                            </Label>
                            <Input
                              id={`attendance-${course.id}`}
                              type="number"
                              min="0"
                              max="100"
                              value={courseEdit.attendance}
                              onChange={(e) => {
                                setAllGradesEdits(prev => ({
                                  ...prev,
                                  [course.id]: {
                                    ...(prev[course.id] || courseEdit),
                                    attendance: e.target.value,
                                  }
                                }))
                              }}
                              placeholder="N/A"
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`trend-${course.id}`} className="text-sm font-medium">
                              Performance Trend
                            </Label>
                            <Select 
                              value={courseEdit.trend}
                              onValueChange={(value) => {
                                setAllGradesEdits(prev => ({
                                  ...prev,
                                  [course.id]: {
                                    ...(prev[course.id] || courseEdit),
                                    trend: value,
                                  }
                                }))
                              }}
                            >
                              <SelectTrigger id={`trend-${course.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="up">Up - Improving</SelectItem>
                                <SelectItem value="stable">Stable - Consistent</SelectItem>
                                <SelectItem value="down">Down - Declining</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`type-${course.id}`} className="text-sm font-medium">
                              Assignment Type
                            </Label>
                            <Select 
                              value={courseEdit.assignmentType}
                              onValueChange={(value) => {
                                setAllGradesEdits(prev => ({
                                  ...prev,
                                  [course.id]: {
                                    ...(prev[course.id] || courseEdit),
                                    assignmentType: value,
                                  }
                                }))
                              }}
                            >
                              <SelectTrigger id={`type-${course.id}`}>
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
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
          <div className="flex gap-2 px-6 pb-6 pt-4 border-t flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsViewAllGradesDialogOpen(false)
                setSelectedStudentForAllGrades(null)
                setAllGradesEdits({})
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 gap-2"
              onClick={async () => {
                if (!selectedStudentForAllGrades) return

                try {
                  const updatePromises: Promise<any>[] = []

                  // Update all grades
                  for (const course of data.courses) {
                    const courseGrades = data.gradesByCourse[course.id]
                    const studentGrade = courseGrades?.students.find(
                      (g) => g.studentId === selectedStudentForAllGrades.studentId
                    )

                    if (!studentGrade || !studentGrade.semesterId) continue

                    const courseEdit = allGradesEdits[course.id]
                    if (!courseEdit) continue

                    const newScore = Number(courseEdit.grade)
                    const newAttendance = courseEdit.attendance && courseEdit.attendance.trim() !== ''
                      ? Number(courseEdit.attendance)
                      : null
                    const newTrend = courseEdit.trend as "up" | "down" | "stable" || studentGrade.trend
                    const newAssignmentType = courseEdit.assignmentType || undefined

                    // Only update if values changed
                    if (
                      newScore !== studentGrade.currentGrade ||
                      newAttendance !== studentGrade.attendance ||
                      newTrend !== studentGrade.trend ||
                      newAssignmentType !== (studentGrade.assignmentType || "")
                    ) {
                      updatePromises.push(
                        recordGradeMutation.mutateAsync({
                          studentId: studentGrade.studentModelId || studentGrade.id.replace('pending-', ''),
                          courseId: course.id,
                          semesterId: studentGrade.semesterId,
                          score: newScore,
                          attendance: newAttendance,
                          trend: newTrend,
                          assignmentType: newAssignmentType,
                        })
                      )
                    }
                  }

                  if (updatePromises.length === 0) {
                    toast.info("No changes to save")
                    setIsViewAllGradesDialogOpen(false)
                    setSelectedStudentForAllGrades(null)
                    setAllGradesEdits({})
                    return
                  }

                  await Promise.all(updatePromises)
                  toast.success(`Successfully updated ${updatePromises.length} grade(s)`)
                  setIsViewAllGradesDialogOpen(false)
                  setSelectedStudentForAllGrades(null)
                  setAllGradesEdits({})
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Failed to update grades")
                }
              }}
              disabled={recordGradeMutation.isPending}
            >
              <Save className="w-4 h-4" />
              {recordGradeMutation.isPending ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

