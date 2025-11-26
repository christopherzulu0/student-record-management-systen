"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Search, Mail, BarChart3, AlertCircle, FileText, CheckCircle2, Clock, FileX, Download, Eye, Shield, Check, X, RotateCcw } from "lucide-react"
import { useTeacherStudents, type Student, type DocumentStatus } from "@/lib/hooks/use-teacher-students"
import { useUpdateDocumentStatus } from "@/lib/hooks/use-teacher-documents"
import { EnrollStudentDialog } from "@/components/teacher/EnrollStudentDialog"

export function MyStudentsPageContent() {
  const { data } = useTeacherStudents()
  const myStudents = data.students
  const updateDocumentStatusMutation = useUpdateDocumentStatus()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isDocumentsSheetOpen, setIsDocumentsSheetOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<{ id: string; name: string } | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | "resubmit" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [resubmissionReason, setResubmissionReason] = useState("")

  const filteredStudents = myStudents
    .filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "gpa") return b.gpa - a.gpa
      if (sortBy === "status") return a.status.localeCompare(b.status)
      return 0
    })

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const excellentCount = data.statistics.excellent
  const atRiskCount = data.statistics.atRisk

  const getStatusColor = (status: string) => {
    if (status === "Excellent") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
    if (status === "At Risk") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
  }

  const getDocumentStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case "uploaded":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "rejected":
        return <FileX className="w-4 h-4 text-red-600" />
      case "expired":
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const getDocumentStatusBadge = (status: DocumentStatus) => {
    const variants: Record<DocumentStatus, { className: string; label: string }> = {
      approved: {
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        label: "Approved",
      },
      uploaded: {
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        label: "Under Review",
      },
      rejected: {
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
        label: "Rejected",
      },
      expired: {
        className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
        label: "Expired",
      },
      pending: {
        className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
        label: "Pending",
      },
    }
    return variants[status]
  }

  const handleViewDocuments = (student: Student) => {
    setSelectedStudent(student)
    setIsDocumentsSheetOpen(true)
  }

  // Get fresh student data after document updates - always use latest from query
  const currentStudent = selectedStudent ? myStudents.find((s) => s.id === selectedStudent.id) : null
  const displayStudent = currentStudent || selectedStudent
  const studentDocuments = displayStudent?.documents || []
  
  const requiredDocs = studentDocuments.filter((doc) => doc.required)
  const completedDocs = requiredDocs.filter((doc) => doc.status === "approved").length
  const completionPercentage =
    requiredDocs.length > 0 ? Math.round((completedDocs / requiredDocs.length) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Students</h1>
          <p className="text-muted-foreground mt-2">View and manage your class students</p>
        </div>
        <EnrollStudentDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.total}</div>
            <p className="text-xs text-muted-foreground">In your classes</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Excellent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{excellentCount}</div>
            <p className="text-xs text-muted-foreground">GPA ≥ 3.5</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Good Standing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.statistics.goodStanding}</div>
            <p className="text-xs text-muted-foreground">3.0 - 3.5 GPA</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{atRiskCount}</div>
            <p className="text-xs text-muted-foreground">GPA {"<"} 3.0</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full md:w-48">
          <Card>
            <CardHeader>
              <CardTitle>Sort By</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="gpa">GPA (High to Low)</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Student List</CardTitle>
              <CardDescription className="mt-1">
                {filteredStudents.length} students • Showing {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} • Sorted by {sortBy}
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{student.id}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-sm">{student.email}</TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${student.gpa >= 3.5 ? "text-green-600" : student.gpa >= 3.0 ? "text-blue-600" : "text-red-600"}`}
                      >
                        {student.gpa.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                        {student.grade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View Documents"
                          onClick={() => handleViewDocuments(student)}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="View Details">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Send Email">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          {filteredStudents.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length}{" "}
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

      {/* Documents Sheet */}
      <Sheet open={isDocumentsSheetOpen} onOpenChange={setIsDocumentsSheetOpen}>
        <SheetContent 
          side="right" 
          className="!w-[95vw] sm:!w-[540px] lg:!w-[640px] flex flex-col p-0 gap-0 max-w-[95vw]"
        >
          <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b flex-shrink-0">
            <SheetTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span className="truncate">{displayStudent?.name}'s Documents</span>
            </SheetTitle>
            <SheetDescription className="text-xs sm:text-sm mt-1">
              Student ID: {displayStudent?.id}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0">
            <div className="space-y-4 sm:space-y-6">
              {displayStudent && (
                <>
                  {/* Completion Stats */}
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background">
                        <CardHeader className="pb-2">
                          <div className="flex flex-col items-center text-center">
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mb-1" />
                            <CardTitle className="text-[10px] xs:text-xs font-medium text-muted-foreground leading-tight">Required</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 text-center">
                            {completedDocs}/{requiredDocs.length}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/20 dark:to-background">
                        <CardHeader className="pb-2">
                          <div className="flex flex-col items-center text-center">
                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400 flex-shrink-0 mb-1" />
                            <CardTitle className="text-[10px] xs:text-xs font-medium text-muted-foreground leading-tight">Complete</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400 text-center">{completionPercentage}%</div>
                        </CardContent>
                      </Card>

                      <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-background">
                        <CardHeader className="pb-2">
                          <div className="flex flex-col items-center text-center">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mb-1" />
                            <CardTitle className="text-[10px] xs:text-xs font-medium text-muted-foreground leading-tight">Pending</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400 text-center">
                            {studentDocuments.filter((doc) => doc.status === "uploaded").length || 0}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/20 dark:to-background">
                    <CardContent className="pt-3 sm:pt-4">
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-green-900 dark:text-green-100">
                            Secure Document Access
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 break-words leading-relaxed">
                            All documents are encrypted and securely stored. You have authorized access to view student documents.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documents List */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm sm:text-base">Uploaded Documents</CardTitle>
                      <CardDescription className="text-xs">
                        {studentDocuments.length || 0} document(s) found
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {studentDocuments && studentDocuments.length > 0 ? (
                        <div className="space-y-3">
                          {studentDocuments.map((document) => {
                            const statusBadge = getDocumentStatusBadge(document.status)
                            return (
                              <div
                                key={document.id}
                                className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                              >
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="p-1.5 bg-muted rounded-lg flex-shrink-0">{getDocumentStatusIcon(document.status)}</div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                        <h3 className="font-semibold text-xs sm:text-sm break-words leading-tight">{document.name}</h3>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                        <Badge className={`${statusBadge.className} text-[10px] px-1.5 py-0 h-4`}>{statusBadge.label}</Badge>
                                        {document.required && (
                                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                            Required
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mb-2 break-words leading-relaxed">{document.description}</p>
                                      {document.uploadedDate && (
                                        <div className="flex flex-col gap-1 text-[10px] xs:text-xs text-muted-foreground">
                                          <span>Uploaded: {new Date(document.uploadedDate).toLocaleDateString()}</span>
                                          {document.fileName && (
                                            <div className="flex flex-wrap items-center gap-1">
                                              <span className="break-all font-mono">{document.fileName}</span>
                                              {document.fileSize && (
                                                <>
                                                  <span>•</span>
                                                  <span>{document.fileSize}</span>
                                                </>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {document.fileUrl && (
                                    <div className="flex items-center gap-2 flex-shrink-0 pt-1 border-t">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-8 flex-1"
                                        onClick={() => {
                                          if (document.fileUrl) {
                                            window.open(document.fileUrl, "_blank")
                                          }
                                        }}
                                      >
                                        <Eye className="w-3 h-3 mr-1.5" />
                                        View
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-8 flex-1"
                                        onClick={() => {
                                          if (document.fileUrl) {
                                            const link = window.document.createElement("a")
                                            link.href = document.fileUrl
                                            link.download = document.fileName || "document"
                                            link.target = "_blank"
                                            window.document.body.appendChild(link)
                                            link.click()
                                            window.document.body.removeChild(link)
                                          }
                                        }}
                                      >
                                        <Download className="w-3 h-3 mr-1.5" />
                                        Download
                                      </Button>
                                    </div>
                                  )}
                                  {document.status === "uploaded" && (
                                    <div className="flex items-center gap-2 flex-shrink-0 pt-2 border-t">
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="text-xs h-8 flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => {
                                          setSelectedDocument({ id: document.id, name: document.name })
                                          setActionType("approve")
                                          setActionDialogOpen(true)
                                        }}
                                        disabled={updateDocumentStatusMutation.isPending}
                                      >
                                        <Check className="w-3 h-3 mr-1.5" />
                                        Approve
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        className="text-xs h-8 flex-1"
                                        onClick={() => {
                                          setSelectedDocument({ id: document.id, name: document.name })
                                          setActionType("reject")
                                          setRejectionReason("")
                                          setActionDialogOpen(true)
                                        }}
                                        disabled={updateDocumentStatusMutation.isPending}
                                      >
                                        <X className="w-3 h-3 mr-1.5" />
                                        Reject
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-8 flex-1"
                                        onClick={() => {
                                          setSelectedDocument({ id: document.id, name: document.name })
                                          setActionType("resubmit")
                                          setResubmissionReason("")
                                          setActionDialogOpen(true)
                                        }}
                                        disabled={updateDocumentStatusMutation.isPending}
                                      >
                                        <RotateCcw className="w-3 h-3 mr-1.5" />
                                        Resubmit
                                      </Button>
                                    </div>
                                  )}
                                  {document.status === "approved" && (
                                    <div className="flex items-center gap-2 flex-shrink-0 pt-2 border-t">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-8 flex-1"
                                        onClick={() => {
                                          setSelectedDocument({ id: document.id, name: document.name })
                                          setActionType("resubmit")
                                          setResubmissionReason("")
                                          setActionDialogOpen(true)
                                        }}
                                        disabled={updateDocumentStatusMutation.isPending}
                                      >
                                        <RotateCcw className="w-3 h-3 mr-1.5" />
                                        Request Resubmission
                                      </Button>
                                    </div>
                                  )}
                                  {document.status === "rejected" && (
                                    <div className="flex items-center gap-2 flex-shrink-0 pt-2 border-t">
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="text-xs h-8 flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => {
                                          setSelectedDocument({ id: document.id, name: document.name })
                                          setActionType("approve")
                                          setActionDialogOpen(true)
                                        }}
                                        disabled={updateDocumentStatusMutation.isPending}
                                      >
                                        <Check className="w-3 h-3 mr-1.5" />
                                        Approve
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                          <p className="text-muted-foreground font-medium">No documents uploaded</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            This student has not uploaded any documents yet.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approve Document"}
              {actionType === "reject" && "Reject Document"}
              {actionType === "resubmit" && "Request Resubmission"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && `Are you sure you want to approve "${selectedDocument?.name}"?`}
              {actionType === "reject" && `Please provide a reason for rejecting "${selectedDocument?.name}"`}
              {actionType === "resubmit" && `Please provide instructions for resubmitting "${selectedDocument?.name}"`}
            </DialogDescription>
          </DialogHeader>
          {actionType === "reject" && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Please explain why this document is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
          )}
          {actionType === "resubmit" && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="resubmission-reason">Resubmission Instructions (Optional)</Label>
                <Textarea
                  id="resubmission-reason"
                  placeholder="Provide any specific instructions for resubmission..."
                  value={resubmissionReason}
                  onChange={(e) => setResubmissionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialogOpen(false)
                setRejectionReason("")
                setResubmissionReason("")
                setSelectedDocument(null)
                setActionType(null)
              }}
              disabled={updateDocumentStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "reject" ? "destructive" : "default"}
              onClick={async () => {
                if (!selectedDocument) return
                
                if (actionType === "reject" && !rejectionReason.trim()) {
                  return
                }

                try {
                  await updateDocumentStatusMutation.mutateAsync({
                    documentId: selectedDocument.id,
                    status: actionType === "approve" ? "approved" : actionType === "reject" ? "rejected" : "pending",
                    rejectionReason: actionType === "reject" ? rejectionReason : undefined,
                  })
                  
                  setActionDialogOpen(false)
                  setRejectionReason("")
                  setResubmissionReason("")
                  setSelectedDocument(null)
                  setActionType(null)
                } catch (error) {
                  // Error is handled by the mutation
                }
              }}
              disabled={updateDocumentStatusMutation.isPending || (actionType === "reject" && !rejectionReason.trim())}
            >
              {updateDocumentStatusMutation.isPending ? (
                "Processing..."
              ) : (
                <>
                  {actionType === "approve" && (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
                  {actionType === "reject" && (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </>
                  )}
                  {actionType === "resubmit" && (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Request Resubmission
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
