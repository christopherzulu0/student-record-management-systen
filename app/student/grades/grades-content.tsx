"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Download, Award, TrendingUp, BookOpen, Search } from "lucide-react"
import { useStudentGrades, type StudentGrade } from "@/lib/hooks/use-student-grades"
import { toast } from "sonner"

// TODO: Import PDF generator when available
// import { generateStudentGradesPDF } from "@/lib/utils/pdf-generator-student"

// Helper function to get letter grade from score
const getLetterGrade = (score: number): string => {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

// Helper function to get grade comment
const getGradeComment = (score: number): string => {
  const grade = getLetterGrade(score)
  if (grade === 'A') return 'Excellent'
  if (grade === 'B') return 'Very Good'
  if (grade === 'C') return 'Good'
  if (grade === 'D') return 'Passed'
  if (grade === 'F') return 'Failed'
  return 'N/A'
}

// Helper function to get grade color
const getGradeColor = (score: number): string => {
  if (score >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
  if (score >= 70) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
}

export function StudentGradesPageContent() {
  const { data } = useStudentGrades()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredGrades = data.grades.filter(
    (grade) =>
      grade.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDownloadPDF = async () => {
    // TODO: Implement PDF generation when pdf-generator-student is available
    toast.info("PDF download feature coming soon")
    // try {
    //   await generateStudentGradesPDF(data.grades, data.statistics)
    // } catch (error) {
    //   console.error("Error generating PDF:", error)
    //   toast.error("Failed to generate PDF")
    // }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            My Grades
          </h1>
          <p className="text-muted-foreground mt-2">
            View your academic performance and track your progress
          </p>
        </div>
        <Button onClick={handleDownloadPDF} className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.average.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {data.statistics.averageGrade} • {getGradeComment(data.statistics.average)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.creditsEarned}</div>
            <p className="text-xs text-muted-foreground">
              of {data.statistics.totalCreditsRequired} required
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.grades.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {data.semesters.length} semester{data.semesters.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Course Grades</CardTitle>
          <CardDescription>Search and filter your grades by course name or code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Grades Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Letter Grade</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No grades found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGrades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">{grade.courseCode}</TableCell>
                      <TableCell>{grade.courseName}</TableCell>
                      <TableCell>{grade.semester}</TableCell>
                      <TableCell className="font-semibold">{grade.score}</TableCell>
                      <TableCell>
                        <Badge className={getGradeColor(grade.score)}>
                          {grade.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getGradeComment(grade.score)}
                      </TableCell>
                      <TableCell>{grade.credits}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

