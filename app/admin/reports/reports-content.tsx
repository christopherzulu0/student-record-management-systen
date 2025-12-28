"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { useAdminReports } from "@/lib/hooks/use-admin-reports"

// Helper function to get grade comment
const getGradeComment = (grade: string): string => {
  if (grade.startsWith("A")) return "Excellent"
  if (grade.startsWith("B")) return "Very Good"
  if (grade.startsWith("C")) return "Good"
  if (grade.startsWith("D")) return "Passed"
  if (grade.startsWith("F")) return "Failed"
  return "N/A"
}

export function AdminReportsContent() {
  const { data } = useAdminReports()

  return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">System-wide performance metrics and analysis</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="risks">At Risk Students</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Average</CardTitle>
                </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.systemAverage.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Current semester</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.passRate}%</div>
                <p className="text-xs text-muted-foreground">All courses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Graduation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.graduationRate}%</div>
                <p className="text-xs text-muted-foreground">On schedule</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">At Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.atRiskCount}</div>
                <p className="text-xs text-muted-foreground">Students</p>
              </CardContent>
            </Card>
            </div>

            <Card className="mb-20">
              <CardHeader>
                <CardTitle>Semester Trends</CardTitle>
                <CardDescription>Average and enrollment over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.semesterTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis yAxisId="left" domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="avgAverage" stroke="#3b82f6" strokeWidth={2} name="Average" />
                    <Line yAxisId="right" type="monotone" dataKey="enrolled" stroke="#10b981" strokeWidth={2} name="Enrolled" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Metrics by academic department</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.departments}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dept" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="students" fill="#3b82f6" name="Students" />
                    <Bar yAxisId="right" dataKey="avgAverage" fill="#10b981" name="Avg Average" />
                    <Bar yAxisId="right" dataKey="passRate" fill="#f59e0b" name="Pass Rate" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Department Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Avg Average</TableHead>
                      <TableHead>Pass Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.departments.map((dept, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{dept.dept}</TableCell>
                        <TableCell>{dept.students}</TableCell>
                        <TableCell className="font-semibold">{dept.avgAverage.toFixed(2)}</TableCell>
                        <TableCell>{dept.passRate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>At-Risk Students</CardTitle>
                <CardDescription>Students with Average below 70</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Average</TableHead>
                      <TableHead>Letter Grade</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.atRiskStudents.length > 0 ? (
                      data.atRiskStudents.map((student) => {
                        const letterGrade = student.average >= 90 ? 'A' : student.average >= 80 ? 'B' : student.average >= 70 ? 'C' : student.average >= 60 ? 'D' : 'F'
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.id}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell className="font-semibold text-red-600">{student.average.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {letterGrade}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {getGradeComment(letterGrade)}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded text-sm ${student.status === "Critical" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
                              >
                                {student.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                Contact
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No at-risk students found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
