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
  Activity,
  AlertCircle,
  Calendar,
  TrendingUp,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { useAdminOverview } from "@/lib/hooks/use-admin-overview"

// Icon mapping for recent activity
const iconMap: Record<string, typeof Activity> = {
  Activity,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Calendar,
}

export function AdminOverviewContent() {
  const { data } = useAdminOverview()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Calculate pagination
  const totalItems = data.recentActivity.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedActivities = data.recentActivity.slice(startIndex, endIndex)

  return (
    <>
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
              {paginatedActivities.length > 0 ? (
                paginatedActivities.map((activity) => {
                  const IconComponent = iconMap[activity.icon] || Activity
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-2 md:gap-3 pb-3 border-b last:border-b-0 min-w-0"
                    >
                      <div className="mt-1 p-1.5 md:p-2 bg-muted rounded-lg flex-shrink-0">
                        <IconComponent className="h-3 w-3 md:h-4 md:w-4" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-xs md:text-sm font-medium truncate">{activity.action}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.timestamp}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
            {/* Pagination */}
            {totalItems > 0 && totalPages > 1 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                  </div>
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
                    {(() => {
                      const pages: (number | string)[] = []
                      const showEllipsis = totalPages > 7

                      if (!showEllipsis) {
                        // Show all pages if 7 or fewer
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i)
                        }
                      } else {
                        // Always show first page
                        pages.push(1)

                        if (currentPage <= 4) {
                          // Show pages 1-5, then ellipsis, then last
                          for (let i = 2; i <= 5; i++) {
                            pages.push(i)
                          }
                          pages.push("ellipsis")
                          pages.push(totalPages)
                        } else if (currentPage >= totalPages - 3) {
                          // Show first, ellipsis, then last 5 pages
                          pages.push("ellipsis")
                          for (let i = totalPages - 4; i <= totalPages; i++) {
                            pages.push(i)
                          }
                        } else {
                          // Show first, ellipsis, current-1, current, current+1, ellipsis, last
                          pages.push("ellipsis")
                          pages.push(currentPage - 1)
                          pages.push(currentPage)
                          pages.push(currentPage + 1)
                          pages.push("ellipsis")
                          pages.push(totalPages)
                        }
                      }

                      return pages.map((page, index) => {
                        if (page === "ellipsis") {
                          return (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        }
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(page as number)
                              }}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })
                    })()}
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
            )}
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
              {data.systemAlerts.length > 0 ? (
                data.systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between gap-2 p-2 md:p-3 bg-white dark:bg-slate-800 rounded-lg border border-yellow-200 dark:border-yellow-800 min-w-0"
                  >
                    <p className="text-xs md:text-sm truncate flex-1 min-w-0">{alert.message}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 bg-transparent flex-shrink-0 text-xs whitespace-nowrap"
                    >
                      {alert.action}
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No alerts</p>
              )}
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
                <LineChart
                  data={data.enrollmentTrends}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" style={{ fontSize: "0.7rem" }} />
                  <YAxis style={{ fontSize: "0.7rem" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.5rem",
                      border: "1px solid hsl(var(--border))",
                      fontSize: "0.75rem",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Students"
                  />
                  <Line
                    type="monotone"
                    dataKey="courses"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Courses"
                  />
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
                    data={data.departmentMetrics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.departmentMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.5rem",
                      border: "1px solid hsl(var(--border))",
                      fontSize: "0.75rem",
                    }}
                  />
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
                <BarChart
                  data={data.performanceData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="gpa" style={{ fontSize: "0.7rem" }} />
                  <YAxis style={{ fontSize: "0.7rem" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.5rem",
                      border: "1px solid hsl(var(--border))",
                      fontSize: "0.75rem",
                    }}
                  />
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
                <BarChart
                  data={data.departmentData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
                >
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
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.5rem",
                      border: "1px solid hsl(var(--border))",
                      fontSize: "0.75rem",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                  <Bar
                    yAxisId="left"
                    dataKey="enrollment"
                    fill="#3b82f6"
                    name="Enrollment"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="avgGpa"
                    fill="#10b981"
                    name="Avg GPA"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

