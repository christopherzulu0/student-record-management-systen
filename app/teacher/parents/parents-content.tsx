"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  Edit,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from "lucide-react"
import {
  useTeacherParents,
  useAddParentToStudent,
  useUpdateParentStudent,
  useRemoveParentFromStudent,
  type StudentWithParents,
  type Parent,
} from "@/lib/hooks/use-teacher-parents"
import { toast } from "sonner"

export function ParentsPageContent() {
  const { data } = useTeacherParents()
  const students = data.students
  const addParentMutation = useAddParentToStudent()
  const updateParentMutation = useUpdateParentStudent()
  const removeParentMutation = useRemoveParentFromStudent()

  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedStudent, setSelectedStudent] = useState<StudentWithParents | null>(null)
  const [isAddParentDialogOpen, setIsAddParentDialogOpen] = useState(false)
  const [isEditParentDialogOpen, setIsEditParentDialogOpen] = useState(false)
  const [isParentsSheetOpen, setIsParentsSheetOpen] = useState(false)
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null)

  // Form state for adding parent
  const [parentEmail, setParentEmail] = useState("")
  const [relationship, setRelationship] = useState("")
  const [isPrimary, setIsPrimary] = useState(false)
  const [canViewGrades, setCanViewGrades] = useState(true)
  const [canViewAttendance, setCanViewAttendance] = useState(true)
  const [canViewDocuments, setCanViewDocuments] = useState(true)

  // Form state for editing parent
  const [editRelationship, setEditRelationship] = useState("")
  const [editIsPrimary, setEditIsPrimary] = useState(false)
  const [editCanViewGrades, setEditCanViewGrades] = useState(true)
  const [editCanViewAttendance, setEditCanViewAttendance] = useState(true)
  const [editCanViewDocuments, setEditCanViewDocuments] = useState(true)

  const filteredStudents = students
    .filter(
      (s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      }
      if (sortBy === "gpa") return (b.cumulativeGPA || 0) - (a.cumulativeGPA || 0)
      if (sortBy === "parents") return b.parents.length - a.parents.length
      return 0
    })

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

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

  const handleAddParent = () => {
    if (!selectedStudent) return

    if (!parentEmail.trim()) {
      toast.error("Please enter parent email")
      return
    }

    addParentMutation.mutate(
      {
        studentId: selectedStudent.id,
        parentEmail: parentEmail.trim(),
        relationship: relationship || undefined,
        isPrimary,
        canViewGrades,
        canViewAttendance,
        canViewDocuments,
      },
      {
        onSuccess: () => {
          setIsAddParentDialogOpen(false)
          resetAddParentForm()
        },
      },
    )
  }

  const handleEditParent = () => {
    if (!selectedParent || !selectedStudent) return

    updateParentMutation.mutate(
      {
        id: selectedParent.id,
        data: {
          relationship: editRelationship || undefined,
          isPrimary: editIsPrimary,
          canViewGrades: editCanViewGrades,
          canViewAttendance: editCanViewAttendance,
          canViewDocuments: editCanViewDocuments,
        },
      },
      {
        onSuccess: () => {
          setIsEditParentDialogOpen(false)
          setSelectedParent(null)
        },
      },
    )
  }

  const handleRemoveParent = (parent: Parent) => {
    if (confirm(`Are you sure you want to remove ${parent.firstName} ${parent.lastName} from ${selectedStudent?.firstName}'s profile?`)) {
      removeParentMutation.mutate(parent.id)
    }
  }

  const resetAddParentForm = () => {
    setParentEmail("")
    setRelationship("")
    setIsPrimary(false)
    setCanViewGrades(true)
    setCanViewAttendance(true)
    setCanViewDocuments(true)
  }

  const openAddParentDialog = (student: StudentWithParents) => {
    setSelectedStudent(student)
    resetAddParentForm()
    setIsAddParentDialogOpen(true)
  }

  const openEditParentDialog = (student: StudentWithParents, parent: Parent) => {
    setSelectedStudent(student)
    setSelectedParent(parent)
    setEditRelationship(parent.relationship || "")
    setEditIsPrimary(parent.isPrimary)
    setEditCanViewGrades(parent.canViewGrades)
    setEditCanViewAttendance(parent.canViewAttendance)
    setEditCanViewDocuments(parent.canViewDocuments)
    setIsEditParentDialogOpen(true)
  }

  const openParentsSheet = (student: StudentWithParents) => {
    setSelectedStudent(student)
    setIsParentsSheetOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parent Management</h1>
          <p className="text-muted-foreground mt-2">Add and manage parents for your students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              With Parents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.statistics.withParents}</div>
            <p className="text-xs text-muted-foreground">Linked to parents</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Without Parents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.statistics.withoutParents}</div>
            <p className="text-xs text-muted-foreground">Need parent links</p>
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
                  placeholder="Search by name, email, or student ID..."
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
                  <SelectItem value="parents">Parents Count</SelectItem>
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
                {filteredStudents.length} students • Showing {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length}
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
                  <TableHead>Parents</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-muted-foreground" />
                          {student.firstName} {student.lastName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {student.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {student.cumulativeGPA?.toFixed(2) || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{student.parents.length}</span>
                          {student.parents.length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                              {student.parents.filter(p => p.isPrimary).length > 0 && "Primary"}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            student.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                          }
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openParentsSheet(student)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openAddParentDialog(student)}
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Add Parent
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Add Parent Dialog */}
      <Dialog open={isAddParentDialogOpen} onOpenChange={setIsAddParentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Parent to Student</DialogTitle>
            <DialogDescription>
              Add a parent to {selectedStudent?.firstName} {selectedStudent?.lastName}'s profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="parent-email">Parent Email *</Label>
              <Input
                id="parent-email"
                type="email"
                placeholder="parent@example.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The parent must be registered in the system with this email address
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger id="relationship">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Guardian">Guardian</SelectItem>
                  <SelectItem value="Step-Parent">Step-Parent</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-primary"
                checked={isPrimary}
                onCheckedChange={(checked) => setIsPrimary(checked === true)}
              />
              <Label htmlFor="is-primary" className="font-normal cursor-pointer">
                Set as primary contact parent
              </Label>
            </div>
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-semibold">Viewing Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can-view-grades"
                    checked={canViewGrades}
                    onCheckedChange={(checked) => setCanViewGrades(checked === true)}
                  />
                  <Label htmlFor="can-view-grades" className="font-normal cursor-pointer">
                    Can view grades
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can-view-attendance"
                    checked={canViewAttendance}
                    onCheckedChange={(checked) => setCanViewAttendance(checked === true)}
                  />
                  <Label htmlFor="can-view-attendance" className="font-normal cursor-pointer">
                    Can view attendance
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can-view-documents"
                    checked={canViewDocuments}
                    onCheckedChange={(checked) => setCanViewDocuments(checked === true)}
                  />
                  <Label htmlFor="can-view-documents" className="font-normal cursor-pointer">
                    Can view documents
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddParentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddParent} disabled={addParentMutation.isPending}>
              {addParentMutation.isPending ? "Adding..." : "Add Parent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Parent Dialog */}
      <Dialog open={isEditParentDialogOpen} onOpenChange={setIsEditParentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Parent Relationship</DialogTitle>
            <DialogDescription>
              Update {selectedParent?.firstName} {selectedParent?.lastName}'s relationship with {selectedStudent?.firstName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-relationship">Relationship</Label>
              <Select value={editRelationship} onValueChange={setEditRelationship}>
                <SelectTrigger id="edit-relationship">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Guardian">Guardian</SelectItem>
                  <SelectItem value="Step-Parent">Step-Parent</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is-primary"
                checked={editIsPrimary}
                onCheckedChange={(checked) => setEditIsPrimary(checked === true)}
              />
              <Label htmlFor="edit-is-primary" className="font-normal cursor-pointer">
                Set as primary contact parent
              </Label>
            </div>
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-semibold">Viewing Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-can-view-grades"
                    checked={editCanViewGrades}
                    onCheckedChange={(checked) => setEditCanViewGrades(checked === true)}
                  />
                  <Label htmlFor="edit-can-view-grades" className="font-normal cursor-pointer">
                    Can view grades
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-can-view-attendance"
                    checked={editCanViewAttendance}
                    onCheckedChange={(checked) => setEditCanViewAttendance(checked === true)}
                  />
                  <Label htmlFor="edit-can-view-attendance" className="font-normal cursor-pointer">
                    Can view attendance
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-can-view-documents"
                    checked={editCanViewDocuments}
                    onCheckedChange={(checked) => setEditCanViewDocuments(checked === true)}
                  />
                  <Label htmlFor="edit-can-view-documents" className="font-normal cursor-pointer">
                    Can view documents
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditParentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditParent} disabled={updateParentMutation.isPending}>
              {updateParentMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Parents Sheet */}
      <Sheet open={isParentsSheetOpen} onOpenChange={setIsParentsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Parents for {selectedStudent?.firstName} {selectedStudent?.lastName}
            </SheetTitle>
            <SheetDescription>
              Manage parents linked to this student's profile
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {selectedStudent?.parents.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No parents linked to this student</p>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      setIsParentsSheetOpen(false)
                      openAddParentDialog(selectedStudent!)
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Parent
                  </Button>
                </CardContent>
              </Card>
            ) : (
              selectedStudent?.parents.map((parent) => (
                <Card key={parent.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            {parent.firstName} {parent.lastName}
                          </CardTitle>
                          {parent.isPrimary && (
                            <Badge className="bg-primary text-primary-foreground">Primary</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {parent.email}
                          </div>
                          {parent.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {parent.phone}
                            </div>
                          )}
                        </div>
                        {parent.relationship && (
                          <Badge variant="outline" className="mt-2">
                            {parent.relationship}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsParentsSheetOpen(false)
                            openEditParentDialog(selectedStudent!, parent)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveParent(parent)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Viewing Permissions</Label>
                      <div className="flex flex-wrap gap-2">
                        {parent.canViewGrades && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Grades
                          </Badge>
                        )}
                        {parent.canViewAttendance && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Attendance
                          </Badge>
                        )}
                        {parent.canViewDocuments && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Documents
                          </Badge>
                        )}
                        {!parent.canViewGrades && !parent.canViewAttendance && !parent.canViewDocuments && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            No permissions
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {selectedStudent && selectedStudent.parents.length > 0 && (
              <Button
                className="w-full"
                onClick={() => {
                  setIsParentsSheetOpen(false)
                  openAddParentDialog(selectedStudent)
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Another Parent
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

