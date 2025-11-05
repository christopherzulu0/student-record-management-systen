"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Clock,
  UserCheck,
  Activity,
  Calendar,
  Shield,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const enrollmentData = [
  { month: "Jan", students: 450, teachers: 32, courses: 45 },
  { month: "Feb", students: 480, teachers: 32, courses: 45 },
  { month: "Mar", students: 520, teachers: 35, courses: 48 },
  { month: "Apr", students: 550, teachers: 37, courses: 50 },
  { month: "May", students: 585, teachers: 38, courses: 52 },
]

const performanceData = [
  { gpa: "3.8+", count: 45 },
  { gpa: "3.5-3.8", count: 82 },
  { gpa: "3.0-3.5", count: 156 },
  { gpa: "2.5-3.0", count: 198 },
  { gpa: "<2.5", count: 69 },
]

const departmentData = [
  { dept: "Computer Science", enrollment: 125, avgGpa: 3.45 },
  { dept: "Mathematics", enrollment: 98, avgGpa: 3.32 },
  { dept: "English", enrollment: 112, avgGpa: 3.28 },
  { dept: "Physics", enrollment: 87, avgGpa: 3.38 },
]

const atRiskStudents = [
  { id: 1, name: "Alex Johnson", gpa: 2.1, status: "Critical" },
  { id: 2, name: "Maria Garcia", gpa: 2.35, status: "Warning" },
  { id: 3, name: "James Wilson", gpa: 2.48, status: "Warning" },
]

const systemAlerts = [
  { id: 1, type: "warning", message: "15 students with GPA below 2.5", action: "Review" },
  { id: 2, type: "info", message: "New course request pending approval", action: "Approve" },
  { id: 3, type: "success", message: "Grade uploads completed successfully", action: "View" },
]

const teachers = [
  { id: "1", name: "Dr. Jane Smith", email: "jane.smith@university.edu", department: "Computer Science" },
  { id: "2", name: "Dr. John Wilson", email: "john.wilson@university.edu", department: "Mathematics" },
  { id: "3", name: "Prof. Emily Brown", email: "emily.brown@university.edu", department: "English" },
]

const assignedCourses = [
  {
    id: "1",
    code: "CS101",
    name: "Intro to Computer Science",
    teacher: "Dr. Jane Smith",
    semester: "Fall 2024",
    enrolled: "28/30",
    status: "Active",
  },
  {
    id: "2",
    code: "MATH201",
    name: "Calculus II",
    teacher: "Dr. John Wilson",
    semester: "Fall 2024",
    enrolled: "24/25",
    status: "Active",
  },
  {
    id: "3",
    code: "ENG102",
    name: "English Composition",
    teacher: "Prof. Emily Brown",
    semester: "Fall 2024",
    enrolled: "32/35",
    status: "Active",
  },
]

const departmentMetrics = [
  { name: "Computer Science", value: 125, color: "#3b82f6" },
  { name: "Mathematics", value: 98, color: "#10b981" },
  { name: "English", value: 112, color: "#f59e0b" },
  { name: "Physics", value: 87, color: "#8b5cf6" },
]

const semesters = [
  {
    id: "1",
    name: "Fall 2024",
    year: 2024,
    startDate: "2024-09-01",
    endDate: "2024-12-15",
    status: "active",
    registrationDeadline: "2024-08-15",
    courseCount: 52,
  },
  {
    id: "2",
    name: "Spring 2025",
    year: 2025,
    startDate: "2025-01-15",
    endDate: "2025-05-10",
    status: "draft",
    registrationDeadline: "2024-12-20",
    courseCount: 0,
  },
  {
    id: "3",
    name: "Summer 2025",
    year: 2025,
    startDate: "2025-06-01",
    endDate: "2025-08-15",
    status: "planning",
    registrationDeadline: "2025-05-01",
    courseCount: 0,
  },
]

const recentActivity = [
  { id: 1, action: "New student registered", timestamp: "2 hours ago", icon: UserCheck },
  { id: 2, action: "3 grades submitted by teachers", timestamp: "4 hours ago", icon: TrendingUp },
  { id: 3, action: "Course CS101 enrollment at capacity", timestamp: "6 hours ago", icon: AlertCircle },
  { id: 4, action: "Spring 2025 semester created", timestamp: "1 day ago", icon: Calendar },
]

export function AdminDashboard() {
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false)
  const [isAssignTeacherOpen, setIsAssignTeacherOpen] = useState(false)
  const [isAddSemesterOpen, setIsAddSemesterOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-8">
      {/* Enhanced Header with System Status */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold">Administration</h1>
            <p className="text-muted-foreground mt-1">Manage students, courses, faculty, and system security</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-3 py-1">
              ✓ System Secure
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Encryption Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">100%</p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">All records encrypted with AES-256</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Last Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">Today</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">2:30 AM • Automated daily backup</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-950">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Access Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">3 Roles</p>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Granular role-based permissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-none bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Total Students</CardTitle>
            <Users className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold">585</div>
            <p className="text-xs opacity-75">+35 this month</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Faculty Members</CardTitle>
            <UserCheck className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold">38</div>
            <p className="text-xs opacity-75">Active instructors</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Courses</CardTitle>
            <BookOpen className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold">52</div>
            <p className="text-xs opacity-75">Current semester</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium opacity-90">System GPA</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold">3.21</div>
            <p className="text-xs opacity-75">Average</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium opacity-90">At Risk</CardTitle>
            <AlertCircle className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold">15</div>
            <p className="text-xs opacity-75">Students</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Course</DialogTitle>
                  <DialogDescription>Create a new course for the university</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="course-code">Course Code</Label>
                    <Input id="course-code" placeholder="e.g., CS102" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course-name">Course Name</Label>
                    <Input id="course-name" placeholder="e.g., Advanced Web Development" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course-credits">Credits</Label>
                    <Input id="course-credits" type="number" placeholder="e.g., 3" />
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Create Course</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAssignTeacherOpen} onOpenChange={setIsAssignTeacherOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-green-600 hover:bg-green-700">
                  <UserCheck className="h-4 w-4" />
                  Assign Teacher
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Teacher to Course</DialogTitle>
                  <DialogDescription>Assign a teacher to teach a specific course</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="select-course">Course</Label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cs101">CS101 - Intro to CS</SelectItem>
                        <SelectItem value="math201">MATH201 - Calculus II</SelectItem>
                        <SelectItem value="eng102">ENG102 - English Composition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="select-teacher">Teacher</Label>
                    <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fall">Fall 2024</SelectItem>
                        <SelectItem value="spring">Spring 2025</SelectItem>
                        <SelectItem value="summer">Summer 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">Assign Course</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddSemesterOpen} onOpenChange={setIsAddSemesterOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Calendar className="h-4 w-4" />
                  Add Semester
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Semester</DialogTitle>
                  <DialogDescription>Add a new academic semester to the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="semester-name">Semester Name</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fall">Fall</SelectItem>
                        <SelectItem value="spring">Spring</SelectItem>
                        <SelectItem value="summer">Summer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester-year">Year</Label>
                    <Input id="semester-year" type="number" placeholder="e.g., 2025" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registration-deadline">Registration Deadline</Label>
                    <Input id="registration-deadline" type="date" />
                  </div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Create Semester</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline">View Reports</Button>
            <Button variant="outline">System Settings</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="semesters">Semesters</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity and Alerts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                      <div className="mt-1 p-2 bg-muted rounded-lg">
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alert Section */}
            <Card className="border-l-4 border-l-yellow-500 border-none shadow-md bg-yellow-50 dark:bg-yellow-950">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {systemAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-yellow-200 dark:border-yellow-800"
                    >
                      <p className="text-sm">{alert.message}</p>
                      <Button size="sm" variant="outline" className="ml-auto bg-transparent">
                        {alert.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Enrollment Trends</CardTitle>
                <CardDescription className="text-xs">5-month overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" style={{ fontSize: "0.75rem" }} />
                    <YAxis style={{ fontSize: "0.75rem" }} />
                    <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} name="Students" />
                    <Line type="monotone" dataKey="courses" stroke="#10b981" strokeWidth={2} name="Courses" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Department Distribution</CardTitle>
                <CardDescription className="text-xs">Student enrollment by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={departmentMetrics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-base">GPA Distribution</CardTitle>
                <CardDescription className="text-xs">Student performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="gpa" style={{ fontSize: "0.75rem" }} />
                    <YAxis style={{ fontSize: "0.75rem" }} />
                    <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Department Performance</CardTitle>
                <CardDescription className="text-xs">Enrollment vs average GPA</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="dept" angle={-45} textAnchor="end" height={80} style={{ fontSize: "0.75rem" }} />
                    <YAxis yAxisId="left" style={{ fontSize: "0.75rem" }} />
                    <YAxis yAxisId="right" orientation="right" style={{ fontSize: "0.75rem" }} />
                    <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="enrollment" fill="#3b82f6" name="Enrollment" radius={[8, 8, 0, 0]} />
                    <Bar yAxisId="right" dataKey="avgGpa" fill="#10b981" name="Avg GPA" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="semesters" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Semester Management</CardTitle>
                  <CardDescription>Create and manage academic semesters</CardDescription>
                </div>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {semesters.map((semester) => (
                  <Card key={semester.id} className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{semester.name}</CardTitle>
                          <CardDescription className="text-xs">{semester.year}</CardDescription>
                        </div>
                        <Badge
                          className={
                            semester.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : semester.status === "draft"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                          }
                        >
                          {semester.status.charAt(0).toUpperCase() + semester.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs">
                            {semester.startDate} to {semester.endDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs">Register by {semester.registrationDeadline}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs">{semester.courseCount} courses</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="flex-1">
                          <Trash2 className="h-3 w-3 mr-1 text-red-500" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Course Assignments</CardTitle>
                  <CardDescription>Manage courses and teacher assignments</CardDescription>
                </div>
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="pt-1">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                          {course.code}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{course.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">Instructor: {course.teacher}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{course.semester}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <Activity className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{course.enrolled} enrolled</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          course.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : ""
                        }
                      >
                        {course.status}
                      </Badge>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
