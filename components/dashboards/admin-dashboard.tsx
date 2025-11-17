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
import CourseDialog from "./AdminComponents/CourseDialog"
import TeacherDialog from "./AdminComponents/TeacherDialog"
import SemesterDialog from "./AdminComponents/SemesterDialog"
import { SemestersTabContent } from "./semesters-tab-content"
import { CoursesTabContent } from "./courses-tab-content"
import StatsCard from "./AdminComponents/StatsCard"

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




const departmentMetrics = [
  { name: "Computer Science", value: 125, color: "#3b82f6" },
  { name: "Mathematics", value: 98, color: "#10b981" },
  { name: "English", value: 112, color: "#f59e0b" },
  { name: "Physics", value: 87, color: "#8b5cf6" },
]


const recentActivity = [
  { id: 1, action: "New student registered", timestamp: "2 hours ago", icon: UserCheck },
  { id: 2, action: "3 grades submitted by teachers", timestamp: "4 hours ago", icon: TrendingUp },
  { id: 3, action: "Course CS101 enrollment at capacity", timestamp: "6 hours ago", icon: AlertCircle },
  { id: 4, action: "Spring 2025 semester created", timestamp: "1 day ago", icon: Calendar },
]

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6 md:space-y-8 px-4 md:px-6 pb-6">
      {/* Enhanced Header with System Status */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
          <div className="flex-1 min-w-0 overflow-hidden">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold truncate">Administration</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1 line-clamp-2">
              Manage students, courses, faculty, and system security
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-3 py-1 text-xs md:text-sm whitespace-nowrap">
              ✓ System Secure
            </Badge>
          </div>
        </div>
      </div>

  

      {/* Key Metrics Grid */}
  <StatsCard/>

      {/* Quick Actions */}
      <Card className="border-none shadow-md overflow-hidden w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <CourseDialog/>
            <TeacherDialog/>
            <SemesterDialog/>
            <Button variant="outline" className="text-xs md:text-sm whitespace-nowrap">View Reports</Button>
            <Button variant="outline" className="text-xs md:text-sm whitespace-nowrap">System Settings</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="overview" className="text-xs md:text-sm truncate">Overview</TabsTrigger>
          <TabsTrigger value="semesters" className="text-xs md:text-sm truncate">Semesters</TabsTrigger>
          <TabsTrigger value="courses" className="text-xs md:text-sm truncate">Courses</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          {/* Recent Activity and Alerts */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 w-full">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm md:text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                  <span className="truncate">Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="space-y-3 md:space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-2 md:gap-3 pb-3 border-b last:border-b-0 min-w-0">
                      <div className="mt-1 p-1.5 md:p-2 bg-muted rounded-lg flex-shrink-0">
                        <activity.icon className="h-3 w-3 md:h-4 md:w-4" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-xs md:text-sm font-medium truncate">{activity.action}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alert Section */}
            <Card className="border-l-4 border-l-yellow-500 border-none shadow-md bg-yellow-50 dark:bg-yellow-950 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <span className="truncate">System Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="space-y-2">
                  {systemAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between gap-2 p-2 md:p-3 bg-white dark:bg-slate-800 rounded-lg border border-yellow-200 dark:border-yellow-800 min-w-0"
                    >
                      <p className="text-xs md:text-sm truncate flex-1 min-w-0">{alert.message}</p>
                      <Button size="sm" variant="outline" className="ml-2 bg-transparent flex-shrink-0 text-xs whitespace-nowrap">
                        {alert.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 w-full">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm md:text-base truncate">Enrollment Trends</CardTitle>
                <CardDescription className="text-xs truncate">5-month overview</CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={250} minHeight={200}>
                    <LineChart data={enrollmentData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" style={{ fontSize: "0.7rem" }} />
                      <YAxis style={{ fontSize: "0.7rem" }} />
                      <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", fontSize: "0.75rem" }} />
                      <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                      <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} name="Students" />
                      <Line type="monotone" dataKey="courses" stroke="#10b981" strokeWidth={2} name="Courses" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm md:text-base truncate">Department Distribution</CardTitle>
                <CardDescription className="text-xs truncate">Student enrollment by department</CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={250} minHeight={200}>
                    <PieChart>
                      <Pie
                        data={departmentMetrics}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {departmentMetrics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", fontSize: "0.75rem" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 w-full">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm md:text-base truncate">GPA Distribution</CardTitle>
                <CardDescription className="text-xs truncate">Student performance breakdown</CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={250} minHeight={200}>
                    <BarChart data={performanceData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="gpa" style={{ fontSize: "0.7rem" }} />
                      <YAxis style={{ fontSize: "0.7rem" }} />
                      <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", fontSize: "0.75rem" }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm md:text-base truncate">Department Performance</CardTitle>
                <CardDescription className="text-xs truncate">Enrollment vs average GPA</CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={250} minHeight={200}>
                    <BarChart data={departmentData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="dept" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80} 
                        style={{ fontSize: "0.7rem" }}
                        interval={0}
                      />
                      <YAxis yAxisId="left" style={{ fontSize: "0.7rem" }} />
                      <YAxis yAxisId="right" orientation="right" style={{ fontSize: "0.7rem" }} />
                      <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", fontSize: "0.75rem" }} />
                      <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                      <Bar yAxisId="left" dataKey="enrollment" fill="#3b82f6" name="Enrollment" radius={[8, 8, 0, 0]} />
                      <Bar yAxisId="right" dataKey="avgGpa" fill="#10b981" name="Avg GPA" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="semesters" className="space-y-4 mt-4 md:mt-6 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <SemestersTabContent />
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4 mt-4 md:mt-6 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <CoursesTabContent />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
