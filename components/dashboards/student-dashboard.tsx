"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts"
import {
  Award,
  TrendingUp,
  FileText,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  Calendar,
  Shield,
  Download,
  Target,
  Flame,
  Brain,
  BarChart3,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const gradeData = [
  { name: "CS101", grade: 92, target: 90, trend: "up" },
  { name: "MATH201", grade: 89, target: 85, trend: "down" },
  { name: "ENG102", grade: 87, target: 85, trend: "stable" },
]

const gpaHistory = [
  { semester: "Fall 2023", gpa: 3.7, courses: 3 },
  { semester: "Spring 2024", gpa: 3.75, courses: 4 },
  { semester: "Fall 2024", gpa: 3.82, courses: 3 },
]

const creditData = [
  { name: "Completed", value: 12, fill: "#3b82f6" },
  { name: "In Progress", value: 9, fill: "#10b981" },
  { name: "Remaining", value: 39, fill: "#f3f4f6" },
]

const performanceData = [
  { name: "Test 1", score: 88, class_avg: 82 },
  { name: "Test 2", score: 91, class_avg: 84 },
  { name: "Test 3", score: 92, class_avg: 85 },
  { name: "Quiz 1", score: 95, class_avg: 88 },
  { name: "Quiz 2", score: 89, class_avg: 86 },
]

const upcomingAssignments = [
  {
    id: 1,
    course: "CS101",
    title: "Data Structures Project",
    dueDate: "Nov 15",
    priority: "high",
    progress: 75,
    type: "Project",
  },
  {
    id: 2,
    course: "MATH201",
    title: "Calculus Problem Set",
    dueDate: "Nov 18",
    priority: "medium",
    progress: 50,
    type: "Assignment",
  },
  {
    id: 3,
    course: "ENG102",
    title: "Essay Assignment",
    dueDate: "Nov 20",
    priority: "low",
    progress: 25,
    type: "Essay",
  },
]

const schedule = [
  { time: "09:00", course: "CS101", room: "A201", instructor: "Dr. Jane Smith", duration: "1.5h" },
  { time: "11:00", course: "MATH201", room: "B105", instructor: "Dr. John Wilson", duration: "1.5h" },
  { time: "14:00", course: "ENG102", room: "C301", instructor: "Prof. Emily Brown", duration: "1h" },
]

const academicAlerts = [
  { id: 1, type: "success", message: "Excellent performance in CS101! Keep it up.", icon: CheckCircle },
  { id: 2, type: "warning", message: "MATH201 grade trending down, consider tutoring.", icon: AlertCircle },
  { id: 3, type: "info", message: "You qualify for Dean's List this semester!", icon: Award },
]

export function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="w-full space-y-8 pb-6">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-6 rounded-xl text-white">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold">Welcome back, Alex Chen</h1>
          <p className="text-slate-300 mt-2">Your academic journey is secure and tracked in real-time</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2 bg-white/10 hover:bg-white/20 border-white/20 text-white">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4" />
            Transcript
          </Button>
        </div>
      </div>

      {/* Security Status and Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white border border-green-400/20 flex items-start gap-3">
          <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Records Encrypted</p>
            <p className="text-xs text-green-100 mt-1">AES-256 encryption • Daily backups • Real-time sync</p>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white border border-purple-400/20 flex items-start gap-3">
          <Zap className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">On Track</p>
            <p className="text-xs text-purple-100 mt-1">Maintaining 3.82 GPA • 20% ahead of schedule</p>
          </div>
        </div>
      </div>

      {/* Academic Alerts */}
      {academicAlerts.length > 0 && (
        <div className="space-y-2">
          {academicAlerts.map((alert) => {
            const Icon = alert.icon
            const bgColor =
              alert.type === "success"
                ? "bg-green-50 dark:bg-green-950"
                : alert.type === "warning"
                  ? "bg-orange-50 dark:bg-orange-950"
                  : "bg-blue-50 dark:bg-blue-950"
            const borderColor =
              alert.type === "success"
                ? "border-green-200 dark:border-green-800"
                : alert.type === "warning"
                  ? "border-orange-200 dark:border-orange-800"
                  : "border-blue-200 dark:border-blue-800"
            const iconColor =
              alert.type === "success"
                ? "text-green-600"
                : alert.type === "warning"
                  ? "text-orange-600"
                  : "text-blue-600"

            return (
              <div key={alert.id} className={`p-4 rounded-lg border flex items-center gap-3 ${bgColor} ${borderColor}`}>
                <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
                <p className="text-sm flex-1">{alert.message}</p>
                <Button size="sm" variant="ghost" className="flex-shrink-0">
                  View
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Premium Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-none bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Current GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3.82</div>
            <p className="text-xs text-blue-100 mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +0.07 this semester
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Credits Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12/60</div>
            <p className="text-xs text-green-100 mt-2">20% complete</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Course Avg</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">89.3</div>
            <p className="text-xs text-purple-100 mt-2">+2.4 from last term</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-orange-600 to-red-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Class Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8/120</div>
            <p className="text-xs text-orange-100 mt-2">Top 7%</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-pink-600 to-rose-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">92%</div>
            <p className="text-xs text-pink-100 mt-2">All assignments on time</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            Academic Overview
          </TabsTrigger>
          <TabsTrigger
            value="assignments"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
          >
            Assignments
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
          >
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Grades */}
            <Card className="lg:col-span-2 border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Course Performance
                    </CardTitle>
                    <CardDescription>Your grades vs class targets</CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Above Average
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gradeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Bar dataKey="grade" fill="#3b82f6" name="Your Grade" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="target" fill="#e5e7eb" name="Target" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Credit Progress */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={creditData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value">
                      {creditData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* GPA Trend and Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  GPA Trajectory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={gpaHistory}>
                    <defs>
                      <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[3.5, 4.0]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="gpa" stroke="#3b82f6" fillOpacity={1} fill="url(#colorGpa)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Today's Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedule.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950 dark:to-transparent border border-blue-100 dark:border-blue-900"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{item.course}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.time} • Room {item.room}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.instructor}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {item.duration}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Assignments */}
            <Card className="lg:col-span-2 border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Pending Assignments
                </CardTitle>
                <CardDescription>3 tasks due in next 7 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{assignment.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {assignment.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{assignment.course}</p>
                      </div>
                      <Badge
                        className={
                          assignment.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : assignment.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {assignment.priority}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${assignment.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{assignment.progress}% complete</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {assignment.dueDate}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Assignment Stats */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="h-5 w-5 text-red-600" />
                  Assignment Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-2 px-3 rounded-lg bg-white dark:bg-slate-700">
                  <p className="text-2xl font-bold text-green-600">96%</p>
                  <p className="text-xs text-muted-foreground mt-1">On-time submission</p>
                </div>
                <div className="text-center py-2 px-3 rounded-lg bg-white dark:bg-slate-700">
                  <p className="text-2xl font-bold text-blue-600">15</p>
                  <p className="text-xs text-muted-foreground mt-1">Completed this term</p>
                </div>
                <div className="text-center py-2 px-3 rounded-lg bg-white dark:bg-slate-700">
                  <p className="text-2xl font-bold text-purple-600">92%</p>
                  <p className="text-xs text-muted-foreground mt-1">Average score</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Assessment Scores
              </CardTitle>
              <CardDescription>Your performance vs class average</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Your Score"
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="class_avg"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    name="Class Average"
                    dot={{ fill: "#9ca3af", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Secure Documents */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <CardTitle>Secure Documents</CardTitle>
                <CardDescription>Encrypted & backed up</CardDescription>
              </div>
            </div>
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Export All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Fall 2024 Transcript", size: "2.4 MB", date: "Nov 1, 2024", encrypted: true },
              { name: "Academic Progress Sheet", size: "1.8 MB", date: "Nov 5, 2024", encrypted: true },
              { name: "Degree Audit", size: "956 KB", date: "Oct 20, 2024", encrypted: true },
            ].map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.size} • {doc.date}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                  🔒 Encrypted
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
