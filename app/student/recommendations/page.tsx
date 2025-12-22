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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Mail, Loader2, AlertCircle, Calendar, User, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Teacher = {
  id: string
  name: string
  email: string
  department: string | null
  courses: {
    id: string
    courseCode: string
    name: string
  }[]
}

type Recommendation = {
  id: string
  teacherName: string
  teacherEmail: string
  courseCode: string
  courseName?: string
  purpose: string
  dateRequested: string
  deadline?: string
  status: "pending" | "submitted" | "declined"
  priority: "high" | "medium" | "low"
  submittedAt?: string
  fileUrl?: string | null
  fileName?: string | null
}

export default function StudentRecommendationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false)
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [selectedTeacherId, setSelectedTeacherId] = useState("")
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [purpose, setPurpose] = useState("")
  const [deadline, setDeadline] = useState("")
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium")

  // Fetch teachers when dialog opens
  useEffect(() => {
    if (isDialogOpen && teachers.length === 0) {
      fetchTeachers()
    }
  }, [isDialogOpen])

  // Fetch recommendations on mount
  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchTeachers = async () => {
    setIsLoadingTeachers(true)
    try {
      const response = await fetch("/api/student/teachers")
      if (!response.ok) {
        throw new Error("Failed to fetch teachers")
      }
      const data = await response.json()
      setTeachers(data)
    } catch (error) {
      console.error("Error fetching teachers:", error)
      toast.error("Failed to load teachers. Please try again.")
    } finally {
      setIsLoadingTeachers(false)
    }
  }

  const fetchRecommendations = async () => {
    setIsLoadingRecommendations(true)
    try {
      const response = await fetch("/api/student/recommendations")
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations")
      }
      const data = await response.json()
      console.log("Recommendations data:", data) // Debug log
      // Log each recommendation's fileUrl
      data.forEach((rec: Recommendation) => {
        if (rec.status === "submitted") {
          console.log(`Recommendation ${rec.id} fileUrl:`, rec.fileUrl, "Type:", typeof rec.fileUrl)
        }
      })
      setRecommendations(data)
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      toast.error("Failed to load recommendations. Please try again.")
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!selectedTeacherId) {
      toast.error("Please select a teacher")
      return
    }

    if (!purpose.trim()) {
      toast.error("Please provide a purpose for the recommendation")
      return
    }

    if (!deadline) {
      toast.error("Please select a deadline")
      return
    }

    // Check if deadline is in the future
    const deadlineDate = new Date(deadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (deadlineDate < today) {
      toast.error("Deadline must be in the future")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/student/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherId: selectedTeacherId,
          courseId: selectedCourseId && selectedCourseId !== "none" ? selectedCourseId : null,
          purpose: purpose.trim(),
          deadline: deadline,
          priority: priority,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create recommendation request")
      }

      toast.success("Recommendation request sent successfully!")

      // Reset form
      setSelectedTeacherId("")
      setSelectedCourseId("none")
      setPurpose("")
      setDeadline("")
      setPriority("medium")

      // Close dialog
      setIsDialogOpen(false)

      // Refresh recommendations list
      fetchRecommendations()
    } catch (error) {
      console.error("Error creating recommendation:", error)
      toast.error(error instanceof Error ? error.message : "Failed to send request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: Recommendation["status"]) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      submitted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      declined: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }

    return (
      <Badge variant="outline" className={cn("font-semibold border-0", variants[status])}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleDownload = async (fileUrl: string, fileName?: string | null) => {
    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = fileName || 'recommendation-letter.pdf'
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Download started")
    } catch (error) {
      console.error("Error downloading file:", error)
      toast.error("Failed to download file. Please try again.")
    }
  }

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId)

  return (
    <ProtectedLayout allowedRoles={["student"]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recommendations</h1>
            <p className="text-muted-foreground mt-2">Request and manage recommendation letters</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Request Letter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Request Recommendation Letter</DialogTitle>
                <DialogDescription>Request a recommendation letter from an instructor</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher">Instructor *</Label>
                  {isLoadingTeachers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : teachers.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4" />
                      No teachers available
                    </div>
                  ) : (
                    <Select value={selectedTeacherId} onValueChange={(value) => {
                      setSelectedTeacherId(value)
                      setSelectedCourseId("none") // Reset course when teacher changes
                    }}>
                      <SelectTrigger id="teacher">
                        <SelectValue placeholder="Select an instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {teacher.name} {teacher.department && `- ${teacher.department}`}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {selectedTeacher && selectedTeacher.courses.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="course">Course (Optional)</Label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                      <SelectTrigger id="course">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No specific course</SelectItem>
                        {selectedTeacher.courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.courseCode} - {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose *</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Graduate school, internship, job application, etc."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="pl-9"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    "Send Request"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Recommendations</CardTitle>
            <CardDescription>Letters requested and submitted</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRecommendations ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-lg font-semibold text-foreground mb-1">No recommendations requested yet</p>
                <p className="text-sm text-muted-foreground">Click "Request Letter" to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recommendations.map((rec) => {
                      // Debug log for each recommendation
                      if (rec.status === "submitted") {
                        console.log("Submitted recommendation:", {
                          id: rec.id,
                          status: rec.status,
                          fileUrl: rec.fileUrl,
                          fileName: rec.fileName,
                          hasFileUrl: !!rec.fileUrl,
                          fileUrlType: typeof rec.fileUrl,
                        })
                      }
                      return (
                      <TableRow key={rec.id}>
                        <TableCell className="font-medium">{rec.teacherName}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{rec.courseCode}</span>
                            {rec.courseName && (
                              <span className="text-xs text-muted-foreground">{rec.courseName}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={rec.purpose}>
                          {rec.purpose}
                        </TableCell>
                        <TableCell>{new Date(rec.dateRequested).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {rec.deadline ? new Date(rec.deadline).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>{getStatusBadge(rec.status)}</TableCell>
                        <TableCell>
                          {rec.submittedAt ? new Date(rec.submittedAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-right w-[120px]">
                          {(() => {
                            const isSubmitted = rec.status === "submitted"
                            const fileUrl = rec.fileUrl
                            const hasFileUrl = fileUrl != null && fileUrl !== "" && typeof fileUrl === "string"
                            
                            // Debug for this specific recommendation
                            if (isSubmitted) {
                              console.log(`[Debug] Recommendation ${rec.id}:`, {
                                status: rec.status,
                                fileUrl: fileUrl,
                                fileUrlType: typeof fileUrl,
                                fileUrlLength: fileUrl?.length,
                                hasFileUrl: hasFileUrl,
                                fileName: rec.fileName,
                              })
                            }
                            
                            if (isSubmitted && hasFileUrl) {
                              return (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(fileUrl, rec.fileName)}
                                  className="gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </Button>
                              )
                            } else if (isSubmitted && !hasFileUrl) {
                              return (
                                <span className="text-muted-foreground text-xs" title={`File URL: ${fileUrl || 'null'}`}>
                                  No file
                                </span>
                              )
                            } else if (rec.status === "pending") {
                              return (
                                <span className="text-muted-foreground text-xs">Waiting</span>
                              )
                            } else {
                              return (
                                <span className="text-muted-foreground text-xs">-</span>
                              )
                            }
                          })()}
                        </TableCell>
                      </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 mb-20">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">Tips for Requesting Letters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-blue-900 dark:text-blue-100 text-sm">
            <p>• Request letters at least 3-4 weeks before the deadline</p>
            <p>• Clearly specify the purpose of the letter (graduate school, jobs, etc.)</p>
            <p>• Provide instructors with all relevant information about the opportunity</p>
            <p>• Thank instructors for their time and effort</p>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
