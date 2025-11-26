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
import {
  Mail,
  Phone,
  MapPin,
  Star,
  MessageSquare,
  Search,
  Users,
  Award,
  BookOpen,
  Sparkles,
  Clock,
  GraduationCap,
  TrendingUp,
  Filter,
  Copy,
  ExternalLink
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

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
    bio: "Specializes in algorithms and data structures with 15+ years of teaching experience.",
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
    bio: "Expert in advanced calculus and mathematical analysis with published research.",
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
    bio: "Award-winning educator focused on creative writing and literary analysis.",
  },
]

const getDepartmentColor = (department: string) => {
  const colors: Record<string, { bg: string; border: string; text: string; gradient: string; icon: string }> = {
    "Computer Science": {
      bg: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
      border: "border-blue-200/50 dark:border-blue-800/50",
      text: "text-blue-700 dark:text-blue-300",
      gradient: "from-blue-500 to-cyan-500",
      icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    Mathematics: {
      bg: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
      border: "border-purple-200/50 dark:border-purple-800/50",
      text: "text-purple-700 dark:text-purple-300",
      gradient: "from-purple-500 to-pink-500",
      icon: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    English: {
      bg: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
      border: "border-green-200/50 dark:border-green-800/50",
      text: "text-green-700 dark:text-green-300",
      gradient: "from-green-500 to-emerald-500",
      icon: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
  }
  return colors[department] || {
    bg: "from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30",
    border: "border-gray-200/50 dark:border-gray-800/50",
    text: "text-gray-700 dark:text-gray-300",
    gradient: "from-gray-500 to-slate-500",
    icon: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  }
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text)
  toast.success(`${label} copied to clipboard!`)
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
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
          <div className="p-6 space-y-6">
            {/* Enhanced Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent p-8 shadow-2xl">
              {/* Animated background elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-pulse delay-700" />

              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                          My Instructors
                        </h1>
                        <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                      </div>
                      <p className="text-white/90 mt-1 font-medium">
                        Connect with your course instructors and view their contact information
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick stats in header */}
                <div className="hidden lg:flex items-center gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl cursor-help">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-5 h-5 text-white" />
                          <div>
                            <p className="text-xs text-white/80 font-medium">Avg. Rating</p>
                            <p className="text-2xl font-bold text-white">{averageRating.toFixed(1)}</p>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Average rating across all instructors</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="relative overflow-hidden border-2 border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-950/30 dark:to-background shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-1 cursor-help">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500" />
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">Total Instructors</CardTitle>
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                        {teachers.length}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 font-medium">Active instructors this semester</p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total number of instructors teaching your courses</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="relative overflow-hidden border-2 border-amber-200/50 dark:border-amber-800/50 bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/30 dark:to-background shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-1 cursor-help">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-500" />
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">Average Rating</CardTitle>
                        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                          <Star className="w-5 h-5 text-white fill-white" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-3 h-3 transition-all duration-300",
                              i < Math.floor(averageRating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300 dark:text-gray-600"
                            )}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1 font-medium">Out of 5.0</span>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Average student rating for all instructors</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="relative overflow-hidden border-2 border-green-200/50 dark:border-green-800/50 bg-gradient-to-br from-green-50/80 to-white dark:from-green-950/30 dark:to-background shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-1 cursor-help">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all duration-500" />
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">Excellent Ratings</CardTitle>
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                        {excellentRatings}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 font-medium">
                        {Math.round((excellentRatings / teachers.length) * 100)}% rated 4.5 or higher
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Instructors with ratings of 4.5 stars or above</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Enhanced Filters Section with Tabs */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-primary" />
                      Search & Filter
                    </CardTitle>
                    <CardDescription>Find your instructors by name, course, or department</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <Tabs defaultValue="all" className="w-full" onValueChange={handleDepartmentChange}>
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="all" className="gap-2">
                      <Users className="w-4 h-4" />
                      All
                    </TabsTrigger>
                    {departments.map((dept) => (
                      <TabsTrigger key={dept} value={dept} className="gap-2">
                        <BookOpen className="w-4 h-4" />
                        {dept.split(" ")[0]}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value={selectedDepartment} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="search" className="text-sm font-semibold">Search Instructors</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="search"
                            placeholder="Search by name, course..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-9 h-11 border-2 focus:border-primary transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Results Found</Label>
                        <div className="h-11 px-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-muted-foreground">Instructors</span>
                          </div>
                          <span className="text-2xl font-bold text-primary">{filteredTeachers.length}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Enhanced Teachers Grid */}
            {paginatedTeachers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedTeachers.map((teacher) => {
                    const deptColors = getDepartmentColor(teacher.department)
                    return (
                      <HoverCard key={teacher.id}>
                        <HoverCardTrigger asChild>
                          <Card
                            className={cn(
                              "relative overflow-hidden group cursor-pointer",
                              "bg-gradient-to-br backdrop-blur-sm",
                              deptColors.bg,
                              deptColors.border,
                              "border-2 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                            )}
                          >
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <CardHeader className="pb-4 relative">
                              <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="relative">
                                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                                  <Avatar className="h-16 w-16 border-4 border-white/50 dark:border-white/10 shadow-xl relative">
                                    <AvatarFallback className={cn("text-lg font-bold bg-gradient-to-br", deptColors.gradient, "text-white")}>
                                      {getInitials(teacher.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {/* Online indicator */}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white dark:border-background shadow-lg cursor-help">
                                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Available</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-lg font-bold mb-1 truncate">{teacher.name}</CardTitle>
                                  <Badge variant="outline" className={cn("font-semibold", deptColors.icon, "border-0")}>
                                    {teacher.department}
                                  </Badge>

                                  {/* Rating */}
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1 px-2 py-1 bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-lg">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={cn(
                                            "w-3 h-3 transition-all",
                                            i < Math.floor(teacher.rating)
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "text-gray-300 dark:text-gray-600"
                                          )}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm font-bold">{teacher.rating}</span>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>

                            <Separator className="mx-6" />

                            <CardContent className="space-y-4 relative pt-4">
                              {/* Course Info */}
                              <div className="p-3 bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
                                <div className="flex items-start gap-2">
                                  <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Teaching</p>
                                    <p className="text-sm font-bold leading-tight">{teacher.course}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Office & Hours */}
                              <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white/40 dark:bg-black/10 backdrop-blur-sm">
                                  <div className={cn("p-2 rounded-lg", deptColors.icon)}>
                                    <MapPin className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-muted-foreground">Office</p>
                                    <p className="text-sm font-medium truncate">{teacher.office}</p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white/40 dark:bg-black/10 backdrop-blur-sm">
                                  <div className={cn("p-2 rounded-lg", deptColors.icon)}>
                                    <Clock className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-muted-foreground">Office Hours</p>
                                    <p className="text-sm font-medium">{teacher.officeHours}</p>
                                  </div>
                                </div>
                              </div>

                              <Separator />

                              {/* Contact Buttons */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <a
                                    href={`mailto:${teacher.email}`}
                                    className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/70 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 transition-all duration-300 group/email border border-white/40 shadow-sm hover:shadow-md"
                                  >
                                    <Mail className="w-4 h-4 text-muted-foreground group-hover/email:text-blue-600 dark:group-hover/email:text-blue-400 transition-colors flex-shrink-0" />
                                    <span className="text-sm font-medium group-hover/email:text-blue-600 dark:group-hover/email:text-blue-400 transition-colors truncate">
                                      Email
                                    </span>
                                  </a>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-10 w-10 rounded-xl bg-white/70 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 border-white/40"
                                        onClick={() => copyToClipboard(teacher.email, "Email")}
                                      >
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Copy email</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>

                                <div className="flex items-center gap-2">
                                  <a
                                    href={`tel:${teacher.phone}`}
                                    className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/70 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 transition-all duration-300 group/phone border border-white/40 shadow-sm hover:shadow-md"
                                  >
                                    <Phone className="w-4 h-4 text-muted-foreground group-hover/phone:text-green-600 dark:group-hover/phone:text-green-400 transition-colors flex-shrink-0" />
                                    <span className="text-sm font-medium group-hover/phone:text-green-600 dark:group-hover/phone:text-green-400 transition-colors truncate">
                                      Call
                                    </span>
                                  </a>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-10 w-10 rounded-xl bg-white/70 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 border-white/40"
                                        onClick={() => copyToClipboard(teacher.phone, "Phone")}
                                      >
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Copy phone</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>

                              <Separator />

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="flex-1 bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 text-foreground border-2 border-white/60 shadow-md hover:shadow-lg transition-all duration-300"
                                      size="sm"
                                      variant="outline"
                                    >
                                      <MessageSquare className="w-4 h-4 mr-2" />
                                      Message
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Send a message to {teacher.name.split(" ")[1]}</p>
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href="/student/recommendations" className="flex-1">
                                      <Button
                                        className={cn(
                                          "w-full bg-gradient-to-r shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
                                          deptColors.gradient,
                                          "text-white font-semibold"
                                        )}
                                        size="sm"
                                      >
                                        <Award className="w-4 h-4 mr-2" />
                                        Request
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Request a recommendation letter</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </CardContent>
                          </Card>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80" side="top">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-12 w-12 border-2 border-primary/20">
                                <AvatarFallback className={cn("text-base font-bold bg-gradient-to-br", deptColors.gradient, "text-white")}>
                                  {getInitials(teacher.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold truncate">{teacher.name}</h4>
                                <p className="text-xs text-muted-foreground">{teacher.department}</p>
                              </div>
                            </div>
                            <Separator />
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">About</p>
                              <p className="text-sm leading-relaxed">{teacher.bio}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <ExternalLink className="w-3 h-3" />
                              <span>Hover to preview • Click to view details</span>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    )
                  })}
                </div>

                {/* Pagination */}
                {filteredTeachers.length > 0 && totalPages > 1 && (
                  <Card className="border-2 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-muted-foreground font-medium">
                          Showing {startIndex + 1} to {Math.min(endIndex, filteredTeachers.length)} of{" "}
                          {filteredTeachers.length} results
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="items-per-page" className="text-sm text-muted-foreground font-medium">
                              Per page:
                            </Label>
                            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                              <SelectTrigger id="items-per-page" className="w-20 h-9 border-2">
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
              <Card className="border-2 shadow-lg">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="p-6 bg-muted/50 rounded-full">
                      <Search className="w-16 h-16 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground mb-2">No instructors found</p>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Try adjusting your search or filter criteria to find your instructors
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedDepartment("all")
                      }}
                      className="mt-2"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TooltipProvider>
    </ProtectedLayout>
  )
}
