"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  FileText,
  Eye,
  MessageSquare,
  AlertCircle,
  Zap,
  Shield,
  CheckCircle,
  Flame,
  Target,
  BarChart3,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTeacherStats } from "@/lib/hooks/use-teacher-stats"
import {
  TeacherStatsSkeleton,
  TeacherChartsSkeleton,
  TeacherContentSkeleton,
} from "./TeacherComponents/TeacherStatsSkeleton"

function TeacherDashboardContent() {
  const { data: stats } = useTeacherStats()
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-8 pb-6">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-6 rounded-xl text-white">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold">Teaching Dashboard</h1>
          <p className="text-slate-300 mt-2">Manage courses, grades, and student progress securely</p>
        </div>
      
      </div>


      {/* Premium Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-none bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-blue-100 mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> {stats.classMetrics[0]?.change || "No change"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Active Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeCourses}</div>
            <p className="text-xs text-green-100 mt-2">This semester</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Class Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.classAverage.toFixed(1)}</div>
            <p className="text-xs text-purple-100 mt-2">Overall performance</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-orange-600 to-red-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Letters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingLettersCount}</div>
            <p className="text-xs text-orange-100 mt-2">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.atRisk}</div>
            <p className="text-xs text-red-100 mt-2">Needs intervention</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            Overview
          </TabsTrigger>
          <TabsTrigger value="students" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            Student Analytics
          </TabsTrigger>
          <TabsTrigger
            value="recommendations"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
          >
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Trends */}
            <Card className="lg:col-span-2 border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Class Performance Trends
                </CardTitle>
                <CardDescription>Average grades & submission rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.performanceTrend}>
                    <defs>
                      <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="avg"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorAvg)"
                      name="Avg Grade"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="submissions"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Submissions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Grade Distribution */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-600" />
                  Grade Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={stats.gradeDistribution}
                      cx="50%"
                      cy="45%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="count"
                      label={false}
                    >
                      {stats.gradeDistribution.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => [
                        `${value} students`,
                        props.payload?.name || name
                      ]}
                      contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))" }}
                    />
                    <Legend 
                      formatter={(value, entry: any) => {
                        const payload = entry.payload
                        if (payload && payload.name && payload.count !== undefined) {
                          return `${payload.name}: ${payload.count}`
                        }
                        return value
                      }}
                      wrapperStyle={{ paddingTop: "0.5rem", fontSize: "0.75rem" }}
                      iconType="circle"
                      layout="vertical"
                      verticalAlign="bottom"
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Class Performance and At-Risk */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-none shadow-lg mb-10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Class Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.classData.map((cls, idx) => (
                  <div key={idx} className="p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm">{cls.name}</p>
                      <Badge className={cls.trend === "up" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {cls.trend === "up" ? "↑" : "↓"} {cls.avgGrade}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {cls.students} students • {cls.attendance}% attendance
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${cls.avgGrade}%` }}></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg mb-10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Recent Grades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.recentGrades.slice(0, 3).map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 border rounded-lg bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950 dark:to-transparent"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{entry.student}</p>
                      <p className="text-xs text-muted-foreground">{entry.course}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-blue-600">{entry.grade}</p>
                      <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900">{entry.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 border-none shadow-lg bg-red-50 dark:bg-red-950 mb-10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  At-Risk Students
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.atRiskStudents.slice(0, 3).map((student, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-white dark:bg-slate-800"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.course}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-red-600">{student.grade}</p>
                      <Badge className="text-xs bg-red-200 text-red-800">{student.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students Analytics Tab */}
        <TabsContent value="students" className="space-y-6 mt-6">
          <Card className="border-none shadow-lg mb-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Student Engagement Analytics
              </CardTitle>
              <CardDescription>Track participation and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {stats.classMetrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="text-center p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900"
                  >
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{metric.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">{metric.change}</p>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="submissions"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Assignment Submissions"
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6 mt-6">
          <Card className="border-none shadow-lg mb-10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <CardTitle>Pending Recommendation Requests</CardTitle>
                    <CardDescription>Prioritized by deadline</CardDescription>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-800">{stats.pendingLetters.length} pending</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.pendingLetters.map((letter) => (
                  <div
                    key={letter.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900 dark:to-transparent"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{letter.student}</p>
                        <Badge
                          className={
                            letter.priority === "high"
                              ? "bg-red-100 text-red-800 dark:bg-red-900"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900"
                          }
                        >
                          {letter.priority === "high" ? "🔴" : "🟡"} {letter.priority} priority
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {letter.purpose} • Requested {letter.requestDate}
                      </p>
                      {letter.days !== null && (
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{letter.days} days remaining</span>
                      </div>
                      )}
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Mail className="h-4 w-4 mr-1" />
                      Write Letter
                    </Button>
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

export function TeacherDashboard() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-6 rounded-xl text-white">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold">Teaching Dashboard</h1>
              <p className="text-slate-300 mt-2">Manage courses, grades, and student progress securely</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-slate-700 animate-pulse" />
            ))}
          </div>
          <TeacherStatsSkeleton />
          <TeacherChartsSkeleton />
          <TeacherContentSkeleton />
        </div>
      }
    >
      <TeacherDashboardContent />
    </Suspense>
  )
}
