"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Download,
  MoreHorizontal,
  Trash2,
  Edit,
  User,
  BookOpen,
  Star,
  Users,
  Award,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAdminTeachers, type AdminTeacher } from "@/lib/hooks/use-admin-teachers"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function AdminTeachersContent() {
  const { data } = useAdminTeachers()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDept, setSelectedDept] = useState("All")

  // Action states
  const [editingTeacher, setEditingTeacher] = useState<AdminTeacher | null>(null)
  const [viewingProfileTeacher, setViewingProfileTeacher] = useState<AdminTeacher | null>(null)
  const [viewingCoursesTeacher, setViewingCoursesTeacher] = useState<AdminTeacher | null>(null)
  const [deletingTeacher, setDeletingTeacher] = useState<AdminTeacher | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [teacherDetails, setTeacherDetails] = useState<any>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    status: "",
    department: "",
    rating: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const filteredTeachers = data.teachers.filter(
    (t) =>
      (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.department.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedDept === "All" || t.department === selectedDept),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
      case "on-leave":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
      case "inactive":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
    }
  }

  const handleExportCSV = () => {
    if (filteredTeachers.length === 0) {
      toast.error("No teachers to export")
      return
    }

    const headers = ["Teacher ID", "Name", "Email", "Department", "Courses", "Rating", "Status"]

    const rows = filteredTeachers.map((teacher) => {
      return [
        teacher.id,
        teacher.name,
        teacher.email,
        teacher.department,
        teacher.courses.toString(),
        teacher.rating.toFixed(1),
        teacher.status,
      ]
    })

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const metadata = [
      `Export Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      `Total Teachers: ${filteredTeachers.length}`,
      `Active: ${data.statistics.active}`,
      `Average Rating: ${data.statistics.avgRating}`,
      `Total Courses: ${data.statistics.totalCourses}`,
      "",
    ]

    const fullCSV = [...metadata, csvContent].join("\n")

    const blob = new Blob([fullCSV], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `teachers_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Teachers exported successfully!")
  }

  const handleViewProfile = async (teacher: AdminTeacher) => {
    setViewingProfileTeacher(teacher)
    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/admin/teachers/${teacher.teacherModelId}`)
      if (!response.ok) throw new Error("Failed to fetch teacher details")
      const data = await response.json()
      setTeacherDetails(data.teacher)
    } catch (error) {
      toast.error("Failed to load teacher profile")
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleViewCourses = async (teacher: AdminTeacher) => {
    setViewingCoursesTeacher(teacher)
    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/admin/teachers/${teacher.teacherModelId}`)
      if (!response.ok) throw new Error("Failed to fetch teacher details")
      const data = await response.json()
      setTeacherDetails(data.teacher)
    } catch (error) {
      toast.error("Failed to load teacher courses")
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleEdit = async (teacher: AdminTeacher) => {
    setEditingTeacher(teacher)
    setEditFormData({
      status: teacher.status,
      department: teacher.department,
      rating: teacher.rating.toString(),
    })

    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/admin/teachers/${teacher.teacherModelId}`)
      if (!response.ok) throw new Error("Failed to fetch teacher details")
      const data = await response.json()
      setTeacherDetails(data.teacher)
      setEditFormData({
        status: data.teacher.status === "on_leave" ? "on-leave" : data.teacher.status,
        department: data.teacher.department,
        rating: data.teacher.rating.toString(),
      })
    } catch (error) {
      toast.error("Failed to load teacher details")
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTeacher) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/teachers/${editingTeacher.teacherModelId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: editFormData.status,
          department: editFormData.department,
          rating: Number.parseFloat(editFormData.rating) || 0,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update teacher")
      }

      toast.success("Teacher updated successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] })
      setEditingTeacher(null)
      setEditFormData({ status: "", department: "", rating: "" })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update teacher")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingTeacher) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/teachers/${deletingTeacher.teacherModelId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete teacher")
      }

      toast.success("Teacher deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] })
      setDeletingTeacher(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete teacher")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-purple-800 bg-clip-text text-transparent">
            Faculty Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage {data.statistics.total} instructor records and assignments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Teachers</CardTitle>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              {data.statistics.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Faculty members</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              <Award className="w-5 h-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              {data.statistics.active}
            </div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">Currently teaching</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {data.statistics.totalCourses}
            </div>
            <p className="text-xs text-blue-600 mt-1 font-medium">Being taught</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
              <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
              {data.statistics.avgRating}★
            </div>
            <p className="text-xs text-yellow-600 mt-1 font-medium">From students</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-t-4 border-t-purple-500/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-600" />
            <CardTitle>Search Teachers</CardTitle>
          </div>
          <CardDescription>Filter by name, email, or department</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search teachers..."
              className="pl-11 h-12 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedDept === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDept("All")}
              className={selectedDept === "All" ? "bg-gradient-to-r from-purple-600 to-purple-700" : ""}
            >
              All Departments
            </Button>
            {data.departments.map((dept) => (
              <Button
                key={dept}
                variant={selectedDept === dept ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDept(dept)}
                className={selectedDept === dept ? "bg-gradient-to-r from-purple-600 to-purple-700" : ""}
              >
                {dept}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="lg"
            className="w-full hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 dark:hover:bg-purple-950 bg-transparent"
            onClick={handleExportCSV}
            disabled={filteredTeachers.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Teachers
          </Button>
        </CardContent>
      </Card>

      {/* Teachers List */}
      <Card className="mb-20">
        <CardHeader>
          <CardTitle>Faculty Directory</CardTitle>
          <CardDescription>Total: {filteredTeachers.length} teachers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Courses</TableHead>
                  <TableHead className="font-semibold">Rating</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <TableRow
                      key={teacher.id}
                      className="hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors"
                    >
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{teacher.email}</TableCell>
                      <TableCell className="text-sm">{teacher.department}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400"
                        >
                          {teacher.courses} courses
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-yellow-700 dark:text-yellow-400">
                            {teacher.rating.toFixed(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(teacher.status)} variant="outline">
                          {teacher.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-purple-100 dark:hover:bg-purple-900">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(teacher)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewProfile(teacher)}>
                              <User className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewCourses(teacher)}>
                              <BookOpen className="w-4 h-4 mr-2" />
                              View Courses
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => setDeletingTeacher(teacher)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-12 h-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground font-medium">No teachers found</p>
                        <p className="text-sm text-muted-foreground">
                          {searchTerm || selectedDept !== "All"
                            ? "Try adjusting your search criteria"
                            : "No teachers in the system"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!editingTeacher}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTeacher(null)
            setEditFormData({ status: "", department: "", rating: "" })
            setTeacherDetails(null)
          }
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader className="space-y-2 pb-3 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Edit Teacher</DialogTitle>
                <DialogDescription>Update teacher information</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {editingTeacher && (
            <>
              <ScrollArea className="flex-1 pr-4">
                <form id="edit-teacher-form" onSubmit={handleSaveEdit} className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Teacher ID</Label>
                  <Input value={editingTeacher.id || ""} disabled className="bg-muted/50 h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Rating</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={editFormData.rating || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, rating: e.target.value })}
                    placeholder="0.0"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input value={editingTeacher.name || ""} disabled className="bg-muted/50 h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input value={editingTeacher.email || ""} disabled className="bg-muted/50 h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                  required
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Department</Label>
                <Select
                  value={editFormData.department || undefined}
                  onValueChange={(value) => setEditFormData({ ...editFormData, department: value })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {teacherDetails?.specialization && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Specialization</Label>
                  <Input value={teacherDetails.specialization} disabled className="bg-muted/50 h-9 text-sm" />
                </div>
              )}
                </form>
              </ScrollArea>
              <div className="flex gap-3 pt-3 border-t flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setEditingTeacher(null)
                    setEditFormData({ status: "", department: "", rating: "" })
                    setTeacherDetails(null)
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="edit-teacher-form"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                  disabled={isSaving || !editFormData.status}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!viewingProfileTeacher}
        onOpenChange={(open) => {
          if (!open) {
            setViewingProfileTeacher(null)
            setTeacherDetails(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Teacher Profile</DialogTitle>
                <DialogDescription>
                  {viewingProfileTeacher?.name} ({viewingProfileTeacher?.id})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(85vh-120px)] pr-4">
            {isLoadingDetails ? (
              <div className="py-8 space-y-4">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              </div>
            ) : teacherDetails ? (
              <div className="space-y-6 py-4">
                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-purple-600" />
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          Email
                        </Label>
                        <p className="font-medium mt-1">{teacherDetails.email}</p>
                      </div>
                      {teacherDetails.phone && (
                        <div>
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Phone className="w-3 h-3" />
                            Phone
                          </Label>
                          <p className="font-medium mt-1">{teacherDetails.phone}</p>
                        </div>
                      )}
                    </div>
                    {teacherDetails.address && (
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          Address
                        </Label>
                        <p className="font-medium mt-1">
                          {teacherDetails.address}
                          {teacherDetails.city && `, ${teacherDetails.city}`}
                          {teacherDetails.state && `, ${teacherDetails.state}`}
                          {teacherDetails.zipCode && ` ${teacherDetails.zipCode}`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">Professional Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Department</Label>
                        <p className="font-medium mt-1">{teacherDetails.department}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          Rating
                        </Label>
                        <p className="font-medium text-lg mt-1">{teacherDetails.rating.toFixed(1)}★</p>
                      </div>
                    </div>
                    {teacherDetails.specialization && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Specialization</Label>
                        <p className="font-medium mt-1">{teacherDetails.specialization}</p>
                      </div>
                    )}
                    {teacherDetails.officeLocation && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Office Location</Label>
                        <p className="font-medium mt-1">{teacherDetails.officeLocation}</p>
                      </div>
                    )}
                    {teacherDetails.hireDate && (
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          Hire Date
                        </Label>
                        <p className="font-medium mt-1">{new Date(teacherDetails.hireDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!viewingCoursesTeacher}
        onOpenChange={(open) => {
          if (!open) {
            setViewingCoursesTeacher(null)
            setTeacherDetails(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Teacher Courses</DialogTitle>
                <DialogDescription>
                  {viewingCoursesTeacher?.name} ({viewingCoursesTeacher?.id})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(85vh-120px)] pr-4">
            {isLoadingDetails ? (
              <div className="py-8 space-y-4">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </div>
            ) : teacherDetails ? (
              <div className="space-y-4 py-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Teaching Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Total Courses</Label>
                      <p className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mt-1">
                        {teacherDetails.courses?.length || 0}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Department</Label>
                      <p className="font-medium mt-1">{teacherDetails.department}</p>
                    </div>
                  </CardContent>
                </Card>

                {teacherDetails.courses && teacherDetails.courses.length > 0 ? (
                  <div className="space-y-3">
                    {teacherDetails.courses.map((course: any, idx: number) => (
                      <Card
                        key={course.id || idx}
                        className="hover:shadow-md transition-shadow border-l-4 border-l-blue-300"
                      >
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <BookOpen className="w-4 h-4 text-blue-600" />
                                  <h4 className="font-semibold text-lg">{course.name}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground font-mono">{course.code}</p>
                              </div>
                              <Badge
                                className="bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400"
                                variant="outline"
                              >
                                {course.credits} credits
                              </Badge>
                            </div>

                            {course.schedule && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{course.schedule}</span>
                              </div>
                            )}

                            {course.enrolledStudents !== undefined && (
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {course.enrolledStudents} students enrolled
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-muted-foreground font-medium">No courses assigned yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTeacher} onOpenChange={(open) => !open && setDeletingTeacher(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deletingTeacher?.name} ({deletingTeacher?.id}) and all associated records.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
