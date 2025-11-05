"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, FileText, Mail } from "lucide-react"
import { useState } from "react"

const recommendations = [
  {
    id: "1",
    instructorName: "Dr. Jane Smith",
    course: "CS101",
    dateRequested: "2024-03-15",
    status: "Submitted",
    dateSubmitted: "2024-03-20",
  },
]

const instructors = [
  { id: "1", name: "Dr. Jane Smith", course: "CS101" },
  { id: "2", name: "Dr. John Wilson", course: "MATH201" },
  { id: "3", name: "Prof. Emily Brown", course: "ENG102" },
]

export default function StudentRecommendationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <ProtectedLayout allowedRoles={["student"]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recommendations</h1>
            <p className="text-muted-foreground mt-2">Request and manage recommendation letters</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Request Letter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Recommendation Letter</DialogTitle>
                <DialogDescription>Request a recommendation letter from an instructor</DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instructor</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>
                          {inst.name} - {inst.course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Purpose (Optional)</label>
                  <Textarea placeholder="Graduate school, internship, job application, etc." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deadline</label>
                  <input type="date" className="w-full px-3 py-2 border rounded-md" />
                </div>
                <Button type="submit" className="w-full" onClick={() => setIsDialogOpen(false)}>
                  Send Request
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Recommendations</CardTitle>
            <CardDescription>Letters requested and submitted</CardDescription>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No recommendations requested yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recommendations.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell className="font-medium">{rec.instructorName}</TableCell>
                      <TableCell>{rec.course}</TableCell>
                      <TableCell>{new Date(rec.dateRequested).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                          {rec.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(rec.dateSubmitted).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Tips for Requesting Letters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-blue-900 text-sm">
            <p>• Request letters at least 3-4 weeks before the deadline</p>
            <p>• Clearly specify the purpose of the letter (graduate school, jobs, etc.)</p>
            <p>• Provide instructors with all relevant information about the opportunity</p>
            <p>• Thank instructors for their time and effort</p>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
