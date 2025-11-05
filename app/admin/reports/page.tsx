"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

const departmentData = [
  { dept: "Computer Science", students: 150, avgGPA: 3.65, passRate: 94 },
  { dept: "Mathematics", students: 120, avgGPA: 3.58, passRate: 91 },
  { dept: "Engineering", students: 200, avgGPA: 3.52, passRate: 89 },
  { dept: "Business", students: 180, avgGPA: 3.45, passRate: 87 },
]

const semesterTrends = [
  { semester: "Fall 2022", avgGPA: 3.35, enrolled: 400, graduated: 85 },
  { semester: "Spring 2023", avgGPA: 3.42, enrolled: 420, graduated: 90 },
  { semester: "Fall 2023", avgGPA: 3.48, enrolled: 450, graduated: 95 },
  { semester: "Spring 2024", avgGPA: 3.55, enrolled: 480, graduated: 100 },
]

const riskStudents = [
  { id: "STU045", name: "Robert Wilson", gpa: 2.1, status: "At Risk" },
  { id: "STU089", name: "Emma Davis", gpa: 2.3, status: "At Risk" },
  { id: "STU124", name: "Lucas Anderson", gpa: 2.0, status: "Critical" },
]

export default function ReportsPage() {
  return (
    <ProtectedLayout allowedRoles={["admin"]}>
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
                  <CardTitle className="text-sm font-medium">System GPA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3.55</div>
                  <p className="text-xs text-muted-foreground">Current semester</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">90%</div>
                  <p className="text-xs text-muted-foreground">All courses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Graduation Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">On schedule</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">At Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">Students</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Semester Trends</CardTitle>
                <CardDescription>GPA and enrollment over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={semesterTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis yAxisId="left" domain={[3.0, 4.0]} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="avgGPA" stroke="#3b82f6" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="enrolled" stroke="#10b981" strokeWidth={2} />
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
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dept" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="students" fill="#3b82f6" name="Students" />
                    <Bar yAxisId="right" dataKey="avgGPA" fill="#10b981" name="Avg GPA" />
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
                      <TableHead>Avg GPA</TableHead>
                      <TableHead>Pass Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentData.map((dept, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{dept.dept}</TableCell>
                        <TableCell>{dept.students}</TableCell>
                        <TableCell className="font-semibold">{dept.avgGPA}</TableCell>
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
                <CardDescription>Students with GPA below 2.5</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riskStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.id}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell className="font-semibold text-red-600">{student.gpa}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}
