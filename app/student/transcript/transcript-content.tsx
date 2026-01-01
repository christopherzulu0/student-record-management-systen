"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Award, BookOpen, GraduationCap, Search, Mail, Calendar, User } from "lucide-react"
import { useStudentTranscript } from "@/lib/hooks/use-student-transcript"
import { toast } from "sonner"

// TODO: Import PDF generator when available
// import { generateStudentTranscriptPDF } from "@/lib/utils/pdf-generator"

// Helper function to get grade color
const getGradeColor = (score: number): string => {
  if (score >= 90) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
  if (score >= 80) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
  if (score >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
  if (score >= 60) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
}

// Helper function to get academic standing color
const getAcademicStandingColor = (standing: string): string => {
  const lower = standing.toLowerCase()
  if (lower.includes("good") || lower.includes("excellent")) {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
  }
  if (lower.includes("probation") || lower.includes("warning")) {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
  }
  if (lower.includes("suspended") || lower.includes("dismissed")) {
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
  }
  return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
}

export function StudentTranscriptPageContent() {
  const { data } = useStudentTranscript()
  const [searchTerm, setSearchTerm] = useState("")
  const [semesterFilter, setSemesterFilter] = useState<string>("all")

  // Get unique semesters for filter
  const uniqueSemesters = Array.from(new Set(data.semesters.map((s) => s.semester)))

  // Filter semesters
  const filteredSemesters = data.semesters.filter((semester) => {
    const matchesSemester = semesterFilter === "all" || semester.semester === semesterFilter
    const matchesSearch =
      searchTerm === "" ||
      semester.courses.some(
        (course) =>
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    return matchesSemester && matchesSearch
  })

  const handleDownloadPDF = async () => {
    // TODO: Implement PDF generation when pdf-generator is available
    toast.info("PDF download feature coming soon")
    // try {
    //   await generateStudentTranscriptPDF(data)
    // } catch (error) {
    //   console.error("Error generating PDF:", error)
    //   toast.error("Failed to generate PDF")
    // }
  }

  const creditsPercentage =
    data.totalCreditsRequired > 0
      ? Math.round((data.totalCreditsEarned / data.totalCreditsRequired) * 100)
      : 0

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Academic Transcript
          </h1>
          <p className="text-muted-foreground mt-2">Your complete academic record</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{data.studentName}</CardTitle>
                <CardDescription className="mt-1">Student ID: {data.studentId}</CardDescription>
              </div>
              <Badge className={getAcademicStandingColor(data.academicStanding)}>
                {data.academicStanding}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </p>
                <p className="font-medium text-sm">{data.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Enrolled
                </p>
                <p className="font-medium text-sm">
                  {new Date(data.enrollmentDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  GPA
                </p>
                <p className="font-medium text-sm">{data.average.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Credits
                </p>
                <p className="font-medium text-sm">
                  {data.totalCreditsEarned} / {data.totalCreditsRequired}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Course History</CardTitle>
              <CardDescription>View your courses by semester</CardDescription>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {uniqueSemesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Semester Cards */}
      {filteredSemesters.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No courses found</p>
              <p className="text-sm">
                {searchTerm || semesterFilter !== "all"
                  ? "Try adjusting your search criteria"
                  : "No courses in transcript"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        filteredSemesters.map((semester) => (
          <Card key={semester.semester}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{semester.semester}</CardTitle>
                  <CardDescription>
                    {semester.courses.length} course{semester.courses.length !== 1 ? "s" : ""} • GPA:{" "}
                    {semester.average.toFixed(2)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {semester.courses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No courses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    semester.courses.map((course, idx) => (
                      <TableRow key={`${course.code}-${idx}`}>
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell className="font-semibold">{course.score.toFixed(1)}</TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(course.score)}>{course.grade}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Overall GPA</p>
              <p className="text-2xl font-bold">{data.average.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Credits Earned</p>
              <p className="text-2xl font-bold">
                {data.totalCreditsEarned} / {data.totalCreditsRequired} ({creditsPercentage}%)
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Semesters</p>
              <p className="text-2xl font-bold">{data.semesters.length}</p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-1">Academic Standing</p>
            <Badge className={getAcademicStandingColor(data.academicStanding)}>
              {data.academicStanding}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

