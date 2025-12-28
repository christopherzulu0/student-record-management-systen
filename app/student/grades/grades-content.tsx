"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Download, TrendingUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState } from "react"
import { useStudentGrades } from "@/lib/hooks/use-student-grades"
import { generateStudentGradesPDF } from "@/lib/utils/pdf-generator-student"
import { toast } from "sonner"

const getGradeBadgeColor = (grade: string) => {
  if (grade.startsWith("A")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
  if (grade.startsWith("B")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
  if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
}

const getGradeComment = (grade: string): string => {
  if (grade.startsWith("A")) return "Excellent"
  if (grade.startsWith("B")) return "Very Good"
  if (grade.startsWith("C")) return "Good"
  if (grade.startsWith("D")) return "Passed"
  if (grade.startsWith("F")) return "Failed"
  return "N/A"
}

export function StudentGradesPageContent() {
  const { data } = useStudentGrades()
  const { grades, statistics, semesters, gradeProgressionData } = data

  const [selectedSemester, setSelectedSemester] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const filteredGrades = grades.filter(
    (grade) => selectedSemester === "all" || grade.semester === selectedSemester,
  )

  // Pagination calculations
  const totalPages = Math.ceil(filteredGrades.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedGrades = filteredGrades.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Grades</h1>
          <p className="text-muted-foreground mt-2">View all your course grades and performance metrics</p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            setIsGeneratingPDF(true)
            try {
              await generateStudentGradesPDF({
                grades: filteredGrades,
                statistics,
                selectedSemester,
              })
              toast.success("PDF generated successfully")
            } catch (error) {
              console.error("Error generating PDF:", error)
              toast.error("Failed to generate PDF. Please try again.")
            } finally {
              setIsGeneratingPDF(false)
            }
          }}
          disabled={isGeneratingPDF}
        >
          <Download className="w-4 h-4 mr-2" />
          {isGeneratingPDF ? "Generating..." : "Download PDF"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.average.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All courses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.creditsEarned}</div>
            <p className="text-xs text-muted-foreground">Out of {statistics.totalCreditsRequired} required</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageGrade}</div>
            <p className="text-xs text-muted-foreground">All courses</p>
          </CardContent>
        </Card>
      </div>

      {gradeProgressionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Grade Progression
            </CardTitle>
            <CardDescription>Your performance trend across assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={gradeProgressionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="assignment1" stroke="#ef4444" name="Assignment 1" />
                <Line type="monotone" dataKey="assignment2" stroke="#f59e0b" name="Assignment 2" />
                <Line type="monotone" dataKey="assignment3" stroke="#10b981" name="Assignment 3" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="mb-20">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Academic Grades</CardTitle>
              <CardDescription className="mt-1">
                {filteredGrades.length} courses • Showing {startIndex + 1}-{Math.min(endIndex, filteredGrades.length)} of {filteredGrades.length}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="semester-filter" className="text-sm text-muted-foreground">
                  Semester:
                </Label>
                <Select value={selectedSemester} onValueChange={handleSemesterChange}>
                  <SelectTrigger id="semester-filter" className="w-40 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {semesters.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Semester</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedGrades.length > 0 ? (
                paginatedGrades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">{grade.course}</TableCell>
                    <TableCell>{grade.courseName}</TableCell>
                    <TableCell>
                      <Badge className={getGradeBadgeColor(grade.grade)}>{grade.grade}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{getGradeComment(grade.grade)}</TableCell>
                    <TableCell>{grade.score > 0 ? `${grade.score}%` : 'N/A'}</TableCell>
                    <TableCell>{grade.credits}</TableCell>
                    <TableCell>{grade.semester}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-muted-foreground font-medium">No grades found</p>
                      <p className="text-sm text-muted-foreground">
                        Try selecting a different semester
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
    </div>
  )
}

