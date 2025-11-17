'use client'
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useUpdateSemester, type Semester } from "@/lib/hooks/use-semesters"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

interface EditSemesterDialogProps {
  semester: Semester | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function EditSemesterDialog({ semester, isOpen, onOpenChange }: EditSemesterDialogProps) {
  const [semesterType, setSemesterType] = useState("")
  const [year, setYear] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [nameError, setNameError] = useState("")
  
  const updateSemester = useUpdateSemester()

  // Parse semester name to extract type and year (e.g., "Fall 2025" -> "fall", "2025")
  useEffect(() => {
    if (semester) {
      // Extract semester type (Fall, Spring, Summer) and year from name
      const nameLower = semester.name.toLowerCase()
      let type = ""
      if (nameLower.includes("fall")) {
        type = "fall"
      } else if (nameLower.includes("spring")) {
        type = "spring"
      } else if (nameLower.includes("summer")) {
        type = "summer"
      }
      
      // Extract year (4 digits)
      const yearMatch = semester.name.match(/\d{4}/)
      const yearStr = yearMatch ? yearMatch[0] : ""
      
      setSemesterType(type)
      setYear(yearStr)

      // Format dates for input fields (YYYY-MM-DD)
      const start = new Date(semester.startDate)
      const end = new Date(semester.endDate)
      setStartDate(start.toISOString().split('T')[0])
      setEndDate(end.toISOString().split('T')[0])
      setIsActive(semester.isActive)
      setNameError("")
    }
  }, [semester])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!semester) return

    setNameError("") // Clear previous errors

    // Validate required fields
    if (!semesterType || !year || !startDate || !endDate) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate year
    const yearNum = parseInt(year)
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      toast.error("Please enter a valid year (2000-2100)")
      return
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error("Please enter valid dates")
      return
    }

    if (end <= start) {
      toast.error("End date must be after start date")
      return
    }

    // Create semester name (e.g., "Fall 2025")
    const semesterName = `${semesterType.charAt(0).toUpperCase() + semesterType.slice(1)} ${year}`

    try {
      await updateSemester.mutateAsync({
        id: semester.id,
        data: {
          name: semesterName,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          isActive,
        },
      })
      
      toast.success("Semester updated successfully")
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update semester"
      toast.error(errorMessage)
      
      // If it's a name conflict, highlight the field
      if (errorMessage.includes("already exists") || errorMessage.includes("Semester")) {
        setNameError(errorMessage)
      }
    }
  }

  if (!semester) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Semester</DialogTitle>
          <DialogDescription>Update semester information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-semester-type">Semester Type *</Label>
            <Select value={semesterType} onValueChange={(value) => {
              setSemesterType(value)
              setNameError("")
            }}>
              <SelectTrigger id="edit-semester-type" className={nameError ? "border-destructive" : ""}>
                <SelectValue placeholder="Select semester type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fall">Fall</SelectItem>
                <SelectItem value="spring">Spring</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
              </SelectContent>
            </Select>
            {nameError && (
              <p className="text-sm text-destructive">{nameError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-semester-year">Year *</Label>
            <Input
              id="edit-semester-year"
              type="number"
              placeholder="e.g., 2025"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="2000"
              max="2100"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-start-date">Start Date *</Label>
            <Input
              id="edit-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-end-date">End Date *</Label>
            <Input
              id="edit-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-is-active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked === true)}
            />
            <Label
              htmlFor="edit-is-active"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Set as active semester
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Note: Setting a semester as active will deactivate all other semesters.
          </p>
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={updateSemester.isPending}
          >
            {updateSemester.isPending ? "Updating..." : "Update Semester"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

