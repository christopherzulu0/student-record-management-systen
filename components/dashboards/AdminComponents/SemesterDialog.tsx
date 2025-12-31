'use client'
import React, { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Loader2 } from "lucide-react"
import { useCreateSemester } from "@/lib/hooks/use-semesters"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

function SemesterFormContent({ onSuccess }: { onSuccess: () => void }) {
  const [semesterType, setSemesterType] = useState("")
  const [year, setYear] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [nameError, setNameError] = useState("")
  
  const createSemester = useCreateSemester()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      await createSemester.mutateAsync({
        name: semesterName,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        isActive,
      })
      
      toast.success("Semester created successfully")
      
      // Reset form
      setSemesterType("")
      setYear("")
      setStartDate("")
      setEndDate("")
      setIsActive(false)
      setNameError("")
      
      // Close dialog
      onSuccess()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create semester"
      toast.error(errorMessage)
      
      // If it's a name conflict, highlight the field
      if (errorMessage.includes("already exists") || errorMessage.includes("Semester")) {
        setNameError(errorMessage)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="semester-type">Semester Type *</Label>
        <Select value={semesterType} onValueChange={(value) => {
          setSemesterType(value)
          setNameError("")
        }}>
          <SelectTrigger id="semester-type" className={nameError ? "border-destructive" : ""}>
            <SelectValue placeholder="Select semester type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semester 1">Semester 1</SelectItem>
            <SelectItem value="Semester 2">Semester 2</SelectItem>
          </SelectContent>
        </Select>
        {nameError && (
          <p className="text-sm text-destructive">{nameError}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="semester-year">Year *</Label>
        <Input
          id="semester-year"
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
        <Label htmlFor="start-date">Start Date *</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end-date">End Date *</Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate || undefined}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is-active"
          checked={isActive}
          onCheckedChange={(checked) => setIsActive(checked === true)}
        />
        <Label
          htmlFor="is-active"
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
        disabled={createSemester.isPending}
      >
        {createSemester.isPending ? "Creating..." : "Create Semester"}
      </Button>
    </form>
  )
}

export default function SemesterDialog() {
  const [isAddSemesterOpen, setIsAddSemesterOpen] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setIsAddSemesterOpen(open)
  }

  return (
    <Dialog open={isAddSemesterOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Calendar className="h-4 w-4" />
          Add Semester
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Semester</DialogTitle>
          <DialogDescription>Add a new academic semester to the system</DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <SemesterFormContent onSuccess={() => setIsAddSemesterOpen(false)} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}