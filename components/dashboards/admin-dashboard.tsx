"use client"

import { useState, Suspense } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CourseDialog from "./AdminComponents/CourseDialog"
import TeacherDialog from "./AdminComponents/TeacherDialog"
import SemesterDialog from "./AdminComponents/SemesterDialog"
import { SemestersTabContent } from "./semesters-tab-content"
import { CoursesTabContent } from "./courses-tab-content"
import StatsCard from "./AdminComponents/StatsCard"
import { AdminOverviewSkeleton } from "./AdminOverviewSkeleton"

const AdminOverviewContent = dynamic(
  () => import("./admin-overview-content").then((mod) => ({ default: mod.AdminOverviewContent })),
  {
    ssr: false,
    loading: () => <AdminOverviewSkeleton />,
  }
)


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
          <Suspense fallback={<AdminOverviewSkeleton />}>
            <AdminOverviewContent />
          </Suspense>
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
