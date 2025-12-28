"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  GraduationCap,
  BookOpen,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Award,
  BarChart3,
  Target,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useParentDashboard, type Child } from "@/lib/hooks/use-parent-dashboard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { generateGradesPDF } from "@/lib/utils/pdf-generator"

function ParentDashboardContent() {
  const { data } = useParentDashboard()
  const [selectedStudent, setSelectedStudent] = useState<Child | null>(
    data.children.length > 0 ? data.children[0] : null
  )
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  
  // Get all available semesters from API (including inactive ones)
  const allSemesters = data.semesters || []
  
  // Extract unique years from semesters
  const years = Array.from(
    new Set(
      allSemesters.map((s) => {
        const startDate = new Date(s.startDate)
        return startDate.getFullYear().toString()
      })
    )
  ).sort((a, b) => Number(b) - Number(a)) // Sort descending (newest first)

  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8 max-w-7xl">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No children linked to your account.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Filter semesters by selected year, then sort
  const filteredSemestersByYear = allSemesters.filter((s) => {
    if (selectedYear === "all") return true
    const startDate = new Date(s.startDate)
    return startDate.getFullYear().toString() === selectedYear
  })

  // Use filtered semesters, sorted by active status and date
  const semesters = filteredSemestersByYear
    .sort((a, b) => {
      // Sort by active status first (active semesters first), then by start date (newest first)
      if (a.isActive !== b.isActive) {
        return b.isActive ? 1 : -1
      }
      const dateA = new Date(a.startDate).getTime()
      const dateB = new Date(b.startDate).getTime()
      return dateB - dateA
    })
    .map((s) => ({
      id: s.id,
      name: s.name,
      startDate: s.startDate,
      endDate: s.endDate,
    }))

  // Filter enrollments and grades by selected semester
  const filteredEnrollments =
    selectedSemesterId === "all"
      ? selectedStudent.enrollments
      : selectedStudent.enrollments.filter((e) => e.semesterId === selectedSemesterId)

  const filteredGrades =
    selectedSemesterId === "all"
      ? selectedStudent.grades
      : selectedStudent.grades.filter((g) => g.semesterId === selectedSemesterId)

  // Calculate statistics based on filtered data
  const gradesWithAttendance = filteredGrades.filter((g) => g.attendance !== null)
  const avgAttendance =
    gradesWithAttendance.length > 0
      ? gradesWithAttendance.reduce((sum, g) => sum + (g.attendance || 0), 0) / gradesWithAttendance.length
      : 0
  const progressPercentage =
    (selectedStudent.totalCreditsEarned / selectedStudent.totalCreditsRequired) * 100
  const hasAlerts = selectedStudent.documents.some(
    (d) => d.status === "expired" || d.status === "pending"
  )
  const totalAssignments = filteredGrades.reduce((sum, g) => sum + g.assignments, 0)
  const completedAssignments = filteredGrades.reduce((sum, g) => sum + g.completed, 0)

  // Set default semester to most recent if not set
  if (selectedSemesterId === "all" && semesters.length > 0 && selectedStudent.enrollments.length > 0) {
    // Don't auto-set, let user choose "all" by default
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8 max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Parent Portal</p>
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl text-balance">
              Welcome back, {data.parent.firstName}
            </h1>
          </div>

          <div className="flex gap-2">
            {data.children.map((student) => {
              const isSelected = selectedStudent.id === student.id
              return (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student)
                    setSelectedSemesterId("all") // Reset semester filter when switching students
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/50 bg-card hover:border-primary/30 hover:bg-card/80",
                  )}
                >
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={`/.jpg?height=36&width=36&query=${student.firstName}`} />
                    <AvatarFallback className="text-xs font-semibold">
                      {student.firstName[0]}
                      {student.lastName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-left">
                    <p className="text-sm font-semibold leading-none">{student.firstName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {student.yearOfStudy ? `Year ${student.yearOfStudy}` : "Student"}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Average Card */}
          <Card className="border-border/50 transition-all hover:border-primary/30 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Average
                </CardTitle>
                <div className="rounded-md bg-primary/10 p-1.5">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">
                  {(selectedStudent.average ?? 0).toFixed(2)}
                </span>
                <span className="text-base font-medium text-muted-foreground">/ 100</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="border-accent/30 bg-accent/10 text-xs text-accent px-2 py-0">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {(selectedStudent.semesterAverage ?? 0).toFixed(2)}
                </Badge>
                <span className="text-xs text-muted-foreground">this semester</span>
              </div>

              {selectedStudent.averageHistory && selectedStudent.averageHistory.length > 0 && (
                <div className="h-12 w-full">
                  <MiniChart data={selectedStudent.averageHistory} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credits Progress Card */}
          <Card className="border-border/50 transition-all hover:border-chart-2/30 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Credits Progress
                </CardTitle>
                <div className="rounded-md bg-chart-2/10 p-1.5">
                  <Target className="h-4 w-4 text-chart-2" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">
                  {selectedStudent.totalCreditsEarned}
                </span>
                <span className="text-base font-medium text-muted-foreground">
                  / {selectedStudent.totalCreditsRequired}
                </span>
              </div>

              <div className="space-y-2">
                <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-chart-2 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {Math.round(progressPercentage)}% complete
                  </span>
                  <span className="text-muted-foreground">
                    {selectedStudent.totalCreditsRequired - selectedStudent.totalCreditsEarned} left
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Card */}
          <Card className="border-border/50 transition-all hover:border-chart-3/30 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Attendance
                </CardTitle>
                <div className="rounded-md bg-chart-3/10 p-1.5">
                  <BarChart3 className="h-4 w-4 text-chart-3" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">
                  {Math.round(avgAttendance)}%
                </span>
                <span className="text-base font-medium text-muted-foreground">average</span>
              </div>

              <div className="space-y-2">
                <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-chart-3 transition-all duration-500"
                    style={{ width: `${avgAttendance}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {filteredEnrollments.length} courses
                    {selectedSemesterId !== "all" && (
                      <span className="text-muted-foreground/70">
                        {" "}
                        ({selectedStudent.enrollments.length} total)
                      </span>
                    )}
                  </div>
                  <span>•</span>
                  <div>
                    {completedAssignments}/{totalAssignments} assignments
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Card */}
          <Card className="border-border/50 transition-all hover:border-chart-4/30 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Documents
                </CardTitle>
                <div className="rounded-md bg-chart-4/10 p-1.5">
                  <FileText className="h-4 w-4 text-chart-4" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">
                  {selectedStudent.documents.filter((d) => d.status === "approved").length}
                </span>
                <span className="text-base font-medium text-muted-foreground">
                  / {selectedStudent.documents.length}
                </span>
              </div>

              {hasAlerts ? (
                <Badge
                  variant="outline"
                  className="w-full justify-center border-destructive/30 bg-destructive/10 text-xs text-destructive py-1"
                >
                  <AlertCircle className="mr-1.5 h-3 w-3" />
                  Action required
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="w-full justify-center border-accent/30 bg-accent/10 text-xs text-accent py-1"
                >
                  <CheckCircle className="mr-1.5 h-3 w-3" />
                  All approved
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="grades" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="justify-start border-b border-border bg-transparent p-0 h-auto rounded-none">
              <TabsTrigger
                value="grades"
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <Award className="mr-2 h-4 w-4" />
                Grades
              </TabsTrigger>
              <TabsTrigger
                value="courses"
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <FileText className="mr-2 h-4 w-4" />
                Documents
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!selectedStudent) return
                  setIsGeneratingPDF(true)
                  try {
                    const selectedSemesterName =
                      selectedSemesterId === "all"
                        ? "All Semesters"
                        : semesters.find((s) => s.id === selectedSemesterId)?.name || "All Semesters"

                    await generateGradesPDF({
                      student: selectedStudent,
                      selectedSemesterName,
                      filteredGrades,
                      filteredEnrollments,
                    })
                    toast.success("PDF generated successfully")
                  } catch (error) {
                    console.error("Error generating PDF:", error)
                    toast.error("Failed to generate PDF. Please try again.")
                  } finally {
                    setIsGeneratingPDF(false)
                  }
                }}
                disabled={isGeneratingPDF || !selectedStudent}
              >
                <Download className="mr-2 h-4 w-4" />
                {isGeneratingPDF ? "Generating..." : "Download PDF"}
              </Button>
              <Label htmlFor="year-select" className="text-sm text-muted-foreground">
                Year:
              </Label>
              <Select
                value={selectedYear}
                onValueChange={(value) => {
                  setSelectedYear(value)
                  setSelectedSemesterId("all") // Reset semester when year changes
                }}
              >
                <SelectTrigger id="year-select" className="w-[120px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label htmlFor="semester-select" className="text-sm text-muted-foreground">
                Semester:
              </Label>
              <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
                <SelectTrigger id="semester-select" className="w-[240px]">
                  <SelectValue placeholder="Select semester">
                    {selectedSemesterId === "all"
                      ? "All Semesters"
                      : semesters.find((s) => s.id === selectedSemesterId)?.name || "Select semester"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesters.length > 0 ? (
                    semesters.map((semester) => {
                      const startDate = new Date(semester.startDate)
                      const endDate = new Date(semester.endDate)
                      const startDateStr = startDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                      const endDateStr = endDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                      return (
                        <SelectItem key={semester.id} value={semester.id}>
                          <div className="flex flex-col py-0.5">
                            <span className="font-medium leading-tight">{semester.name}</span>
                            <span className="text-xs text-muted-foreground leading-tight">
                              {startDateStr} - {endDateStr}
                            </span>
                          </div>
                        </SelectItem>
                      )
                    })
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                      No semesters available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="grades" className="mt-6 space-y-3">
            {filteredGrades.length > 0 ? (
              filteredGrades.map((grade) => (
                <Card key={grade.courseCode} className="border-border/50 hover:border-primary/20 transition-colors mb-10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-base leading-tight">{grade.courseName}</h3>
                              {getTrendIcon(grade.trend)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{grade.courseCode}</p>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold">{grade.score}%</div>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {getLetterGradeDisplay(grade.letterGrade)}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
                          {grade.attendance !== null && (
                            <div>
                              <p className="text-xs text-muted-foreground">Attendance</p>
                              <p className="text-sm font-semibold mt-0.5">{grade.attendance}%</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground">Assignments</p>
                            <p className="text-sm font-semibold mt-0.5">
                              {grade.completed}/{grade.assignments}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Completion</p>
                            <p className="text-sm font-semibold mt-0.5">
                              {grade.assignments > 0
                                ? Math.round((grade.completed / grade.assignments) * 100)
                                : 0}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>
                    {selectedStudent.grades.length === 0
                      ? "No grades available. You may not have permission to view grades."
                      : `No grades found for ${selectedSemesterId === "all" ? "any semester" : semesters.find((s) => s.id === selectedSemesterId)?.name || "selected semester"}.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="courses" className="mt-6 space-y-3">
            {filteredEnrollments.length > 0 ? (
              filteredEnrollments.map((enrollment) => {
                const gradeInfo = filteredGrades.find(
                  (g) => g.courseCode === enrollment.courseCode && g.semesterId === enrollment.semesterId
                )

                return (
                  <Card
                    key={enrollment.courseCode}
                    className="border-border/50 hover:border-primary/20 transition-colors mb-10"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base">{enrollment.courseName}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {enrollment.credits} credits
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{enrollment.courseCode}</p>

                          {gradeInfo && (
                            <div className="mt-3 flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span className="text-muted-foreground">Current:</span>
                                <span className="font-semibold">{gradeInfo.score}%</span>
                              </div>
                              {gradeInfo.attendance !== null && (
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-1.5 rounded-full bg-chart-3" />
                                  <span className="text-muted-foreground">Attendance:</span>
                                  <span className="font-semibold">{gradeInfo.attendance}%</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            enrollment.status === "enrolled" &&
                              "border-accent/30 bg-accent/10 text-accent",
                          )}
                        >
                          {enrollment.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>
                    {selectedStudent.enrollments.length === 0
                      ? "No courses enrolled."
                      : `No courses found for ${selectedSemesterId === "all" ? "any semester" : semesters.find((s) => s.id === selectedSemesterId)?.name || "selected semester"}.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="mt-6 space-y-3">
            {selectedStudent.documents.length > 0 ? (
              selectedStudent.documents.map((doc, index) => (
                <Card key={index} className="border-border/50 hover:border-primary/20 transition-colors mb-10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="rounded-md bg-muted p-2 mt-0.5">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base">{doc.name}</h3>
                            {doc.required && (
                              <Badge variant="outline" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>

                          {doc.expiryDate && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Expires: {new Date(doc.expiryDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Badge variant="outline" className={cn("capitalize text-xs", getStatusColor(doc.status))}>
                        {doc.status === "approved" && <CheckCircle className="mr-1 h-3 w-3" />}
                        {doc.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                        {(doc.status === "expired" || doc.status === "rejected") && (
                          <AlertCircle className="mr-1 h-3 w-3" />
                        )}
                        {doc.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No documents available. You may not have permission to view documents.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


function getLetterGradeDisplay(grade: string) {
  return grade.replace(/_/g, "")
}

function getStatusColor(status: string) {
  switch (status) {
    case "approved":
      return "bg-accent/10 text-accent border-accent/20"
    case "pending":
      return "bg-chart-3/10 text-chart-3 border-chart-3/20"
    case "expired":
    case "rejected":
      return "bg-destructive/10 text-destructive border-destructive/20"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-accent" />
    case "down":
      return <TrendingDown className="h-4 w-4 text-destructive" />
    default:
      return null
  }
}

function MiniChart({ data }: { data: { semester: string; average: number }[] }) {
  const max = 100
  
  // Handle edge cases: empty data or single data point
  if (data.length === 0) {
    return null
  }
  
  const points = data.map((d, i) => {
    // Handle division by zero when there's only one data point
    const x = data.length === 1 ? 50 : (i / (data.length - 1)) * 100
    const average = d.average ?? 0
    const y = 100 - (average / max) * 100
    return `${x},${y}`
  })

  return (
    <svg viewBox="0 0 100 40" className="h-20 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(var(--color-primary) / 0.3)" />
          <stop offset="100%" stopColor="rgb(var(--color-primary) / 0.05)" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="rgb(var(--color-primary))"
        strokeWidth="2"
        points={points.join(" ")}
        vectorEffect="non-scaling-stroke"
      />
      <polyline fill="url(#chartGradient)" points={`0,100 ${points.join(" ")} 100,100`} />
      {data.map((d, i) => {
        // Handle division by zero when there's only one data point
        const x = data.length === 1 ? 50 : (i / (data.length - 1)) * 100
        const average = d.average ?? 0
        const y = 100 - (average / max) * 100
        return <circle key={i} cx={x} cy={y} r="2" fill="rgb(var(--color-primary))" vectorEffect="non-scaling-stroke" />
      })}
    </svg>
  )
}

export default function ParentDashboard() {
  return <ParentDashboardContent />
}
