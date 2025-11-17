"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, BookOpen, TrendingUp, UserCheck, Users } from "lucide-react"
import { useAdminStats } from "@/lib/hooks/use-admin-stats"
import StatsCardSkeleton from "./StatsCardSkeleton"

function StatsCardContent() {
  const { data: stats } = useAdminStats()

  return (
    <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-5 w-full">
      <Card className="border-none bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-3 p-4 md:p-6">
          <CardTitle className="text-xs md:text-sm font-medium opacity-90 truncate pr-2">
            Total Students
          </CardTitle>
          <Users className="h-3 w-3 md:h-4 md:w-4 opacity-70 flex-shrink-0" />
        </CardHeader>
        <CardContent className="space-y-1 p-4 md:p-6 pt-0">
          <div className="text-2xl md:text-3xl font-bold truncate">{stats.totalStudents}</div>
          <p className="text-xs opacity-75 truncate">
            {stats.studentsAddedThisMonth > 0
              ? `+${stats.studentsAddedThisMonth} this month`
              : "No new students"}
          </p>
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-3 p-4 md:p-6">
          <CardTitle className="text-xs md:text-sm font-medium opacity-90 truncate pr-2">
            Faculty
          </CardTitle>
          <UserCheck className="h-3 w-3 md:h-4 md:w-4 opacity-70 flex-shrink-0" />
        </CardHeader>
        <CardContent className="space-y-1 p-4 md:p-6 pt-0">
          <div className="text-2xl md:text-3xl font-bold truncate">{stats.totalTeachers}</div>
          <p className="text-xs opacity-75 truncate">Active</p>
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-3 p-4 md:p-6">
          <CardTitle className="text-xs md:text-sm font-medium opacity-90 truncate pr-2">
            Courses
          </CardTitle>
          <BookOpen className="h-3 w-3 md:h-4 md:w-4 opacity-70 flex-shrink-0" />
        </CardHeader>
        <CardContent className="space-y-1 p-4 md:p-6 pt-0">
          <div className="text-2xl md:text-3xl font-bold truncate">{stats.totalCourses}</div>
          <p className="text-xs opacity-75 truncate">Current</p>
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-3 p-4 md:p-6">
          <CardTitle className="text-xs md:text-sm font-medium opacity-90 truncate pr-2">
            System GPA
          </CardTitle>
          <TrendingUp className="h-3 w-3 md:h-4 md:w-4 opacity-70 flex-shrink-0" />
        </CardHeader>
        <CardContent className="space-y-1 p-4 md:p-6 pt-0">
          <div className="text-2xl md:text-3xl font-bold truncate">
            {stats.averageGPA.toFixed(2)}
          </div>
          <p className="text-xs opacity-75 truncate">Average</p>
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl transition-shadow overflow-hidden col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-3 p-4 md:p-6">
          <CardTitle className="text-xs md:text-sm font-medium opacity-90 truncate pr-2">
            At Risk
          </CardTitle>
          <AlertCircle className="h-3 w-3 md:h-4 md:w-4 opacity-70 flex-shrink-0" />
        </CardHeader>
        <CardContent className="space-y-1 p-4 md:p-6 pt-0">
          <div className="text-2xl md:text-3xl font-bold truncate">{stats.atRiskStudents}</div>
          <p className="text-xs opacity-75 truncate">Students</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function StatsCard() {
  return (
    <Suspense fallback={<StatsCardSkeleton />}>
      <StatsCardContent />
    </Suspense>
  )
}