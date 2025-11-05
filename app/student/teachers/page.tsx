"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Mail, Phone, MapPin, Star, MessageSquare, Search, Users, Award, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

const teachers = [
  {
    id: "1",
    name: "Dr. Jane Smith",
    email: "teacher@university.edu",
    phone: "(555) 123-4567",
    department: "Computer Science",
    course: "CS101 - Introduction to Computer Science",
    office: "Science Building 204",
    officeHours: "Monday & Wednesday 2-4 PM",
    rating: 4.8,
  },
  {
    id: "2",
    name: "Dr. John Wilson",
    email: "john.wilson@university.edu",
    phone: "(555) 234-5678",
    department: "Mathematics",
    course: "MATH201 - Calculus II",
    office: "Math Building 105",
    officeHours: "Tuesday & Thursday 1-3 PM",
    rating: 4.6,
  },
  {
    id: "3",
    name: "Prof. Emily Brown",
    email: "emily.brown@university.edu",
    phone: "(555) 345-6789",
    department: "English",
    course: "ENG102 - English Composition",
    office: "Humanities Building 301",
    officeHours: "Monday, Wednesday & Friday 3-5 PM",
    rating: 4.9,
  },
]

const getDepartmentColor = (department: string) => {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    "Computer Science": {
      bg: "from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-700 dark:text-blue-300",
    },
    Mathematics: {
      bg: "from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950",
      border: "border-purple-200 dark:border-purple-800",
      text: "text-purple-700 dark:text-purple-300",
    },
    English: {
      bg: "from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-700 dark:text-green-300",
    },
  }
  return colors[department] || {
    bg: "from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950",
    border: "border-gray-200 dark:border-gray-800",
    text: "text-gray-700 dark:text-gray-300",
  }
}

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)

  const departments = Array.from(new Set(teachers.map((t) => t.department)))

  const filteredTeachers = teachers
    .filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.department.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((teacher) => selectedDepartment === "all" || teacher.department === selectedDepartment)

  // Pagination calculations
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const averageRating = teachers.reduce((sum, t) => sum + t.rating, 0) / teachers.length
  const excellentRatings = teachers.filter((t) => t.rating >= 4.5).length

  return (
    <ProtectedLayout allowedRoles={["student"]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              My Instructors
            </h1>
          <p className="text-muted-foreground mt-2">
            Connect with your course instructors and view their contact information
          </p>
        </div>
                  </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Instructors</CardTitle>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                </div>
              </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{teachers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active instructors</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-background">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                  <Star className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {averageRating.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Out of 5.0 stars</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/20 dark:to-background">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Excellent Ratings</CardTitle>
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{excellentRatings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((excellentRatings / teachers.length) * 100)}% rated 4.5+
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Search Instructors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, course, or department..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Filter by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredTeachers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Instructors found</p>
            </CardContent>
          </Card>
        </div>

        {/* Teachers Grid */}
        {paginatedTeachers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedTeachers.map((teacher) => {
                const deptColors = getDepartmentColor(teacher.department)
                return (
                  <Card
                    key={teacher.id}
                    className={`bg-gradient-to-br ${deptColors.bg} ${deptColors.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold mb-1">{teacher.name}</CardTitle>
                          <CardDescription className="font-medium">{teacher.department}</CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 bg-white/50 dark:bg-black/20 backdrop-blur-sm"
                        >
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{teacher.rating}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Teaching</p>
                        <p className="text-sm font-semibold">{teacher.course}</p>
                </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white/60 dark:bg-black/20 rounded-lg">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Office Location</p>
                            <p className="text-sm font-medium">{teacher.office}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white/60 dark:bg-black/20 rounded-lg">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Office Hours</p>
                            <p className="text-sm font-medium">{teacher.officeHours}</p>
                          </div>
                  </div>
                </div>

                      <div className="space-y-2 pt-2 border-t border-white/20 dark:border-white/10">
                  <a
                    href={`mailto:${teacher.email}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/60 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-200 group"
                  >
                          <Mail className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                          <span className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {teacher.email}
                          </span>
                  </a>
                  <a
                    href={`tel:${teacher.phone}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/60 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-200 group"
                  >
                          <Phone className="w-4 h-4 text-muted-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                          <span className="text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            {teacher.phone}
                          </span>
                  </a>
                </div>

                <div className="flex gap-2 pt-2">
                        <Button
                          className="flex-1 bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 text-foreground border border-white/40"
                          size="sm"
                          variant="outline"
                        >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                        <Button className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" size="sm">
                    Request Recommendation
                  </Button>
                </div>
              </CardContent>
            </Card>
                )
              })}
            </div>

            {/* Pagination */}
            {filteredTeachers.length > 0 && totalPages > 1 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredTeachers.length)} of{" "}
                      {filteredTeachers.length} results
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
                            <SelectItem value="6">6</SelectItem>
                            <SelectItem value="9">9</SelectItem>
                            <SelectItem value="12">12</SelectItem>
                          </SelectContent>
                        </Select>
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
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <Search className="w-12 h-12 text-muted-foreground/50" />
                <p className="text-muted-foreground font-medium">No instructors found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedLayout>
  )
}
