"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import { CheckCircle, Clock, AlertCircle, FileText } from "lucide-react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const pendingRequests = [
  {
    id: "1",
    studentName: "John Doe",
    studentId: "STU001",
    course: "CS101",
    dateRequested: "2024-03-15",
    purpose: "Graduate School Application",
    deadline: "2024-04-30",
    status: "Pending",
    priority: "high",
    daysLeft: 57,
  },
  {
    id: "2",
    studentName: "Jane Smith",
    studentId: "STU002",
    course: "CS101",
    dateRequested: "2024-03-18",
    purpose: "Internship Application",
    deadline: "2024-04-15",
    status: "Pending",
    priority: "high",
    daysLeft: 42,
  },
  {
    id: "3",
    studentName: "Mike Johnson",
    studentId: "STU003",
    course: "CS101",
    dateRequested: "2024-03-10",
    purpose: "Job Application",
    deadline: "2024-03-25",
    status: "Submitted",
    priority: "medium",
    daysLeft: 0,
  },
  {
    id: "4",
    studentName: "Sarah Williams",
    studentId: "STU004",
    course: "CS301",
    dateRequested: "2024-03-20",
    purpose: "Scholarship Application",
    deadline: "2024-04-20",
    status: "Pending",
    priority: "medium",
    daysLeft: 31,
  },
]

export default function TeacherRecommendationsPage() {
  const [selectedRequest, setSelectedRequest] = useState<(typeof pendingRequests)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [letterText, setLetterText] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const handleSubmitLetter = () => {
    setIsDialogOpen(false)
    setLetterText("")
    setSelectedRequest(null)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const pending = pendingRequests.filter((r) => r.status === "Pending")
  const submitted = pendingRequests.filter((r) => r.status === "Submitted")
  const urgent = pending.filter((r) => r.daysLeft <= 7)

  // Pagination calculations for each tab
  const allRequestsData = pendingRequests
  const allTotalPages = Math.ceil(allRequestsData.length / itemsPerPage)
  const allStartIndex = (currentPage - 1) * itemsPerPage
  const allEndIndex = allStartIndex + itemsPerPage
  const paginatedAllRequests = allRequestsData.slice(allStartIndex, allEndIndex)

  const pendingTotalPages = Math.ceil(pending.length / itemsPerPage)
  const pendingStartIndex = (currentPage - 1) * itemsPerPage
  const pendingEndIndex = pendingStartIndex + itemsPerPage
  const paginatedPending = pending.slice(pendingStartIndex, pendingEndIndex)

  const urgentTotalPages = Math.ceil(urgent.length / itemsPerPage)
  const urgentStartIndex = (currentPage - 1) * itemsPerPage
  const urgentEndIndex = urgentStartIndex + itemsPerPage
  const paginatedUrgent = urgent.slice(urgentStartIndex, urgentEndIndex)

  const getStatusIcon = (status: string) => {
    if (status === "Submitted") return <CheckCircle className="w-4 h-4 text-green-600" />
    return <Clock className="w-4 h-4 text-yellow-600" />
  }

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
    if (priority === "medium") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
  }

  return (
    <ProtectedLayout allowedRoles={["teacher"]}>
      <div className="p-6 space-y-6 pb-6">
        <div>
          <h1 className="text-3xl font-bold">Recommendation Letters</h1>
          <p className="text-muted-foreground mt-2">Manage and respond to student recommendation requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">All requests</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pending.length}</div>
              <p className="text-xs text-muted-foreground">To be completed</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{submitted.length}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Urgent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{urgent.length}</div>
              <p className="text-xs text-muted-foreground">Due within 7 days</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All Requests
              <Badge variant="outline" className="ml-2">
                {pendingRequests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              <Badge variant="outline" className="ml-2">
                {pending.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="urgent">
              Urgent
              <Badge variant="outline" className="ml-2">
                {urgent.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                <CardTitle>All Recommendation Requests</CardTitle>
                    <CardDescription className="mt-1">
                      {allRequestsData.length} requests • Showing {allStartIndex + 1}-{Math.min(allEndIndex, allRequestsData.length)} of {allRequestsData.length}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="items-per-page-all" className="text-sm text-muted-foreground">
                        Per page:
                      </Label>
                      <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger id="items-per-page-all" className="w-20 h-9">
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
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAllRequests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div>
                              <p>{request.studentName}</p>
                              <p className="text-xs text-muted-foreground">{request.studentId}</p>
                            </div>
                          </TableCell>
                          <TableCell>{request.course}</TableCell>
                          <TableCell>{request.purpose}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(request.dateRequested).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span
                                className={
                                  request.daysLeft <= 7 && request.daysLeft > 0
                                    ? "font-semibold text-orange-600"
                                    : request.daysLeft <= 0
                                      ? "font-semibold text-green-600"
                                      : ""
                                }
                              >
                                {new Date(request.deadline).toLocaleDateString()}
                              </span>
                              {request.daysLeft > 0 && (
                                <span className="text-xs text-muted-foreground">{request.daysLeft} days left</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={request.status === "Submitted" ? "default" : "outline"}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{request.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog
                              open={isDialogOpen && selectedRequest?.id === request.id}
                              onOpenChange={(open) => {
                                if (!open) setSelectedRequest(null)
                                setIsDialogOpen(open)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant={request.status === "Submitted" ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => setSelectedRequest(request)}
                                  disabled={request.status === "Submitted"}
                                >
                                  {request.status === "Submitted" ? "Submitted" : "Write"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Write Recommendation Letter
                                  </DialogTitle>
                                  <DialogDescription>
                                    For: {selectedRequest?.studentName} ({selectedRequest?.studentId})
                                  </DialogDescription>
                                </DialogHeader>
                                <form className="space-y-4">
                                  <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-xs text-muted-foreground">Course</p>
                                        <p className="font-semibold">{selectedRequest?.course}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground">Purpose</p>
                                        <p className="font-semibold">{selectedRequest?.purpose}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground">Deadline</p>
                                        <p className="font-semibold">{selectedRequest?.deadline}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground">Days Left</p>
                                        <p className="font-semibold">{selectedRequest?.daysLeft || "Overdue"}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Letter Content</label>
                                    <Textarea
                                      placeholder="Write your recommendation letter here. Include specific examples of the student's performance, achievements, and characteristics..."
                                      className="min-h-72"
                                      value={letterText}
                                      onChange={(e) => setLetterText(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button type="submit" className="flex-1" onClick={handleSubmitLetter}>
                                      Submit Letter
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="flex-1 bg-transparent"
                                      onClick={() => setIsDialogOpen(false)}
                                    >
                                      Save Draft
                                    </Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                {allRequestsData.length > 0 && allTotalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {allStartIndex + 1} to {Math.min(allEndIndex, allRequestsData.length)} of {allRequestsData.length}{" "}
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
                        {Array.from({ length: allTotalPages }, (_, i) => i + 1).map((page) => {
                          if (
                            page === 1 ||
                            page === allTotalPages ||
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
                              if (currentPage < allTotalPages) setCurrentPage(currentPage + 1)
                            }}
                            className={currentPage === allTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                <CardTitle>Pending Requests</CardTitle>
                    <CardDescription className="mt-1">
                      {pending.length} requests • Showing {pendingStartIndex + 1}-{Math.min(pendingEndIndex, pending.length)} of {pending.length}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="items-per-page-pending" className="text-sm text-muted-foreground">
                        Per page:
                      </Label>
                      <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger id="items-per-page-pending" className="w-20 h-9">
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
                        <TableHead>Student</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Days Left</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPending.length > 0 ? (
                        paginatedPending.map((request) => (
                          <TableRow key={request.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{request.studentName}</TableCell>
                            <TableCell>{request.purpose}</TableCell>
                            <TableCell>{new Date(request.deadline).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  request.daysLeft <= 3
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                    : request.daysLeft <= 7
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                }
                              >
                                {request.daysLeft} days
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm">Write Letter</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            No pending requests
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                {pending.length > 0 && pendingTotalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {pendingStartIndex + 1} to {Math.min(pendingEndIndex, pending.length)} of {pending.length}{" "}
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
                        {Array.from({ length: pendingTotalPages }, (_, i) => i + 1).map((page) => {
                          if (
                            page === 1 ||
                            page === pendingTotalPages ||
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
                              if (currentPage < pendingTotalPages) setCurrentPage(currentPage + 1)
                            }}
                            className={currentPage === pendingTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="urgent" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Urgent Requests
                </CardTitle>
                    <CardDescription className="mt-1">
                      {urgent.length} requests • Showing {urgentStartIndex + 1}-{Math.min(urgentEndIndex, urgent.length)} of {urgent.length} • Due within 7 days
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="items-per-page-urgent" className="text-sm text-muted-foreground">
                        Per page:
                      </Label>
                      <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger id="items-per-page-urgent" className="w-20 h-9">
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
                {paginatedUrgent.length > 0 ? (
                  <div className="space-y-3">
                    {paginatedUrgent.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-start justify-between p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950 dark:border-red-800"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">{request.studentName}</p>
                            <Badge className="bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100">URGENT</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{request.purpose}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Due: {new Date(request.deadline).toLocaleDateString()} ({request.daysLeft} days left)
                          </p>
                        </div>
                        <Dialog
                          open={isDialogOpen && selectedRequest?.id === request.id}
                          onOpenChange={(open) => {
                            if (!open) setSelectedRequest(null)
                            setIsDialogOpen(open)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedRequest(request)}>Write Letter</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Write Recommendation Letter</DialogTitle>
                              <DialogDescription>
                                For: {selectedRequest?.studentName} ({selectedRequest?.studentId})
                              </DialogDescription>
                            </DialogHeader>
                            <form className="space-y-4">
                              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg space-y-2 text-sm border border-red-200 dark:border-red-800">
                                <p className="font-semibold text-red-700 dark:text-red-300">
                                  This request is urgent and due soon!
                                </p>
                                <p className="text-muted-foreground">
                                  Deadline: {selectedRequest?.deadline} ({selectedRequest?.daysLeft} days remaining)
                                </p>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Letter Content</label>
                                <Textarea
                                  placeholder="Write your recommendation letter here..."
                                  className="min-h-72"
                                  value={letterText}
                                  onChange={(e) => setLetterText(e.target.value)}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button type="submit" className="flex-1" onClick={handleSubmitLetter}>
                                  Submit Letter
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="flex-1 bg-transparent"
                                  onClick={() => setIsDialogOpen(false)}
                                >
                                  Save Draft
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                    <p>No urgent requests right now!</p>
                                      </div>
                  )}
                  {/* Pagination */}
                  {urgent.length > 0 && urgentTotalPages > 1 && (
                    <div className="flex items-center justify-between px-2 py-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {urgentStartIndex + 1} to {Math.min(urgentEndIndex, urgent.length)} of {urgent.length}{" "}
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
                          {Array.from({ length: urgentTotalPages }, (_, i) => i + 1).map((page) => {
                            if (
                              page === 1 ||
                              page === urgentTotalPages ||
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
                                if (currentPage < urgentTotalPages) setCurrentPage(currentPage + 1)
                              }}
                              className={currentPage === urgentTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-amber-900 dark:text-amber-100">Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-amber-900 dark:text-amber-100 text-sm">
            <p>• Be professional and objective in your assessment</p>
            <p>• Include specific examples of the student's performance and achievements</p>
            <p>• Address the purpose of the recommendation directly</p>
            <p>• Meet deadlines to ensure timely submission to the student</p>
            <p>• Letters are confidential and not shared with students before submission</p>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
