"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Download, Printer, Share2, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

const transcriptData = {
  studentName: "John Doe",
  studentId: "STU001",
  email: "john@university.edu",
  enrollmentDate: "2022-09-01",
  cumulativeGPA: 3.75,
  totalCreditsEarned: 24,
  totalCreditsRequired: 60,
  semesters: [
    {
      semester: "Fall 2023",
      gpa: 3.7,
      courses: [
        { code: "CS101", name: "Introduction to Computer Science", credits: 3, grade: "A", score: 92 },
        { code: "MATH201", name: "Calculus II", credits: 4, grade: "A-", score: 89 },
        { code: "ENG102", name: "English Composition", credits: 3, grade: "B+", score: 87 },
      ],
    },
    {
      semester: "Spring 2024",
      gpa: 3.8,
      courses: [
        { code: "CS102", name: "Data Structures", credits: 3, grade: "A", score: 94 },
        { code: "PHYS101", name: "Physics I", credits: 4, grade: "A-", score: 88 },
        { code: "HIST101", name: "World History", credits: 3, grade: "B+", score: 86 },
      ],
    },
  ],
}

const getGradeColor = (grade: string) => {
  if (grade.startsWith("A")) return "text-green-600 font-semibold"
  if (grade.startsWith("B")) return "text-blue-600 font-semibold"
  if (grade.startsWith("C")) return "text-yellow-600 font-semibold"
  return "text-red-600 font-semibold"
}

export default function TranscriptPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Pagination calculations for semesters
  const totalPages = Math.ceil(transcriptData.semesters.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSemesters = transcriptData.semesters.slice(startIndex, endIndex)

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const transcriptText = `
OFFICIAL ACADEMIC TRANSCRIPT
Student: ${transcriptData.studentName}
Student ID: ${transcriptData.studentId}
Email: ${transcriptData.email}
Enrollment Date: ${transcriptData.enrollmentDate}

CUMULATIVE GPA: ${transcriptData.cumulativeGPA}
Credits Earned: ${transcriptData.totalCreditsEarned} / ${transcriptData.totalCreditsRequired}

${transcriptData.semesters
  .map(
    (sem) => `
SEMESTER: ${sem.semester}
GPA: ${sem.gpa}
${sem.courses.map((course) => `${course.code} - ${course.name} | Credits: ${course.credits} | Grade: ${course.grade} | Score: ${course.score}`).join("\n")}
`,
  )
  .join("\n")}
    `
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(transcriptText))
    element.setAttribute("download", `transcript_${transcriptData.studentId}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <ProtectedLayout allowedRoles={["student"]}>
      <div className="p-6 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Academic Transcript</h1>
            <p className="text-muted-foreground mt-2">Official record of your academic performance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <Card className="print:shadow-none print:border-0">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{transcriptData.studentName}</h2>
                  <p className="text-sm text-muted-foreground">Student ID: {transcriptData.studentId}</p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Good Standing
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-semibold">{transcriptData.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Enrollment Date</p>
                  <p className="font-semibold">{new Date(transcriptData.enrollmentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cumulative GPA</p>
                  <p className="text-2xl font-bold text-primary">{transcriptData.cumulativeGPA}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Credits Progress</p>
                  <p className="font-semibold">
                    {transcriptData.totalCreditsEarned}/{transcriptData.totalCreditsRequired}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="print:hidden">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle>Semester Records</CardTitle>
                <CardDescription className="mt-1">
                  {transcriptData.semesters.length} semesters • Showing {startIndex + 1}-{Math.min(endIndex, transcriptData.semesters.length)} of {transcriptData.semesters.length}
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
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {paginatedSemesters.map((semester, index) => (
          <Card key={startIndex + index} className="print:shadow-none print:border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{semester.semester}</CardTitle>
                  <CardDescription>Semester GPA: {semester.gpa}</CardDescription>
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
                    <TableHead>Grade</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {semester.courses.map((course, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell className={getGradeColor(course.grade)}>{course.grade}</TableCell>
                      <TableCell>{course.score}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

        {/* Pagination */}
        {transcriptData.semesters.length > 0 && totalPages > 1 && (
          <Card className="print:hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, transcriptData.semesters.length)} of {transcriptData.semesters.length}{" "}
                  semesters
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
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200 print:shadow-none print:border-0 print:bg-white">
          <CardHeader>
            <CardTitle className="text-blue-900">Academic Standing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm">Your cumulative GPA of {transcriptData.cumulativeGPA} is excellent.</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">
                Progress: {Math.round((transcriptData.totalCreditsEarned / transcriptData.totalCreditsRequired) * 100)}%
                of degree requirements completed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
