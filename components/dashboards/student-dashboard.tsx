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
import { useStudentDashboard } from "@/lib/hooks/use-student-dashboard"

export function StudentDashboard() {
  const { data } = useStudentDashboard()
  const [activeTab, setActiveTab] = useState("overview")

  // Use data from API
  const gradeData = data.courseGrades
  const gpaHistory = data.gpaHistory
  const creditData = data.creditData
  const performanceData = data.performanceData
  const academicAlerts = data.academicAlerts
  const upcomingAssignments = data.upcomingAssignments
  const schedule = data.schedule

  // Calculate GPA change
  const gpaChange = gpaHistory.length >= 2
    ? Number((data.currentGPA - gpaHistory[gpaHistory.length - 2].gpa).toFixed(2))
    : 0

  // Calculate credits percentage
  const creditsPercentage = data.totalCreditsRequired > 0
    ? Math.round((data.creditsEarned / data.totalCreditsRequired) * 100)
    : 0

  // Calculate course average change (placeholder)
  const courseAvgChange = 2.4

  // Calculate class rank percentage
  const rankPercentage = data.totalStudents > 0
    ? Math.round((data.classRank / data.totalStudents) * 100)
    : 0

  return (
    <div className="w-full space-y-8 pb-6">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-6 rounded-xl text-white">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold">Welcome back, {data.name}</h1>
          <p className="text-slate-300 mt-2">Your academic journey is secure and tracked in real-time</p>
        </div>
     
      </div>

   

      {/* Academic Alerts */}
      {/* {academicAlerts.length > 0 && (
        <div className="space-y-2">
            {academicAlerts.map((alert) => {
            const Icon = alert.type === "success" ? CheckCircle : alert.type === "warning" ? AlertCircle : Award
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
      )} */}

      {/* Premium Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-none bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Current GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.currentGPA.toFixed(2)}</div>
            <p className="text-xs text-blue-100 mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> {gpaChange >= 0 ? '+' : ''}{gpaChange.toFixed(2)} this semester
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Credits Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.creditsEarned}/{data.totalCreditsRequired}</div>
            <p className="text-xs text-green-100 mt-2">{creditsPercentage}% complete</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Course Avg</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.courseAverage.toFixed(1)}</div>
            <p className="text-xs text-purple-100 mt-2">+{courseAvgChange.toFixed(1)} from last term</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-orange-600 to-red-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Class Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.classRank}/{data.totalStudents}</div>
            <p className="text-xs text-orange-100 mt-2">Top {rankPercentage}%</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-pink-600 to-rose-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.completionPercentage}%</div>
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
          {/* <TabsTrigger
            value="assignments"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
          >
            Assignments
          </TabsTrigger> */}
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
            {/* <Card className="border-none shadow-lg">
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
            </Card> */}
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

            {/* <Card className="border-none shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Today's Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedule.length > 0 ? schedule.map((item, idx) => (
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
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No schedule available</p>
                  )}
                </div>
              </CardContent>
            </Card> */}
          </div>
        </TabsContent>

        {/* Assignments Tab */}
        {/* <TabsContent value="assignments" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> */}
            {/* Pending Assignments */}
            {/* <Card className="lg:col-span-2 border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Pending Assignments
                </CardTitle>
                <CardDescription>3 tasks due in next 7 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingAssignments.length > 0 ? upcomingAssignments.map((assignment) => (
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
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming assignments</p>
                )}
              </CardContent>
            </Card> */}

            {/* Assignment Stats */}
            {/* <Card className="border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
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
            </Card> */}
          {/* </div>
        </TabsContent> */}

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
            {data.documents.length > 0 ? data.documents.map((doc, idx) => (
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
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">No documents available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
