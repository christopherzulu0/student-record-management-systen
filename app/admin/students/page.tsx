"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Download, MoreHorizontal, Trash2, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const students = [
  {
    id: "STU001",
    name: "John Doe",
    email: "john@university.edu",
    gpa: 3.75,
    enrolled: "2022-09-01",
    status: "active",
    credits: 45,
  },
  {
    id: "STU002",
    name: "Jane Smith",
    email: "jane@university.edu",
    gpa: 3.92,
    enrolled: "2022-09-01",
    status: "active",
    credits: 48,
  },
  {
    id: "STU003",
    name: "Mike Johnson",
    email: "mike@university.edu",
    gpa: 3.45,
    enrolled: "2023-09-01",
    status: "active",
    credits: 30,
  },
  {
    id: "STU004",
    name: "Sarah Williams",
    email: "sarah@university.edu",
    gpa: 3.68,
    enrolled: "2023-09-01",
    status: "suspended",
    credits: 24,
  },
  {
    id: "STU005",
    name: "Tom Brown",
    email: "tom@university.edu",
    gpa: 2.21,
    enrolled: "2023-09-01",
    status: "at-risk",
    credits: 18,
  },
]

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800"
      case "at-risk":
        return "bg-orange-100 text-orange-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.7) return "text-emerald-600"
    if (gpa >= 3.0) return "text-blue-600"
    if (gpa >= 2.5) return "text-orange-600"
    return "text-red-600"
  }

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
    atRisk: students.filter((s) => s.status === "at-risk").length,
    avgGPA: (students.reduce((sum, s) => sum + s.gpa, 0) / students.length).toFixed(2),
  }

  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Students
            </h1>
            <p className="text-muted-foreground mt-2">Manage {stats.total} student records and enrollment</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>Register a new student in the system</DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="john@university.edu" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Student ID</label>
                  <Input placeholder="STU001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Credits</label>
                  <Input type="number" placeholder="0" />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Register Student
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Enrolled</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.active}</div>
              <p className="text-xs text-emerald-600 mt-1">Good standing</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">At Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.atRisk}</div>
              <p className="text-xs text-orange-600 mt-1">GPA &lt; 2.5</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg GPA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgGPA}</div>
              <p className="text-xs text-purple-600 mt-1">System average</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced search and filter section */}
        <Card>
          <CardHeader>
            <CardTitle>Find Students</CardTitle>
            <CardDescription>Search by name, email, or student ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              {selectedStudents.length > 0 && (
                <Button variant="destructive" size="sm">
                  Delete {selectedStudents.length}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student List */}
        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
            <CardDescription>Total: {filteredStudents.length} students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input type="checkbox" className="rounded border" />
                    </TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/50">
                      <TableCell>
                        <input type="checkbox" className="rounded border" />
                      </TableCell>
                      <TableCell className="font-mono text-sm font-semibold">{student.id}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-sm">{student.email}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getGPAColor(student.gpa)}`}>{student.gpa.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>{student.credits}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(student.enrolled).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>View Grades</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
