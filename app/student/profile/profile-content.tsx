"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Phone, MapPin, GraduationCap, AlertCircle, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useStudentProfile, useUpdateStudentProfile } from "@/lib/hooks/use-student-profile"

export function StudentProfilePageContent() {
  const { data: profileData } = useStudentProfile()
  const updateProfileMutation = useUpdateStudentProfile()

  const [formData, setFormData] = useState(profileData)
  const [isEditing, setIsEditing] = useState(false)

  // Update form data when profile data changes
  useEffect(() => {
    setFormData(profileData)
  }, [profileData])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    setFormData(profileData) // Reset to original data
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData)
      setIsEditing(false)
    } catch (error) {
      // Error is handled by the mutation hook
    }
  }

  const completionPercentage = () => {
    const fields = Object.values(formData)
    const filledFields = fields.filter((field) => field !== "" && field !== null && field !== undefined).length
    return Math.round((filledFields / fields.length) * 100)
  }

  const completionPercent = completionPercentage()

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Keep your profile information up to date for better academic services
          </p>
        </div>
        <div className="flex items-center gap-3">
          {updateProfileMutation.isSuccess && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Saved!
            </Badge>
          )}
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={updateProfileMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </div>

      {/* Profile Completion Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Profile Completion</CardTitle>
              <CardDescription>Complete your profile to access all features</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{completionPercent}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                completionPercent >= 90
                  ? "bg-green-600"
                  : completionPercent >= 70
                    ? "bg-blue-600"
                    : completionPercent >= 50
                      ? "bg-yellow-600"
                      : "bg-red-600"
              }`}
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          {completionPercent < 100 && (
            <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Please complete all required fields to unlock full access
            </p>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Personal Information
          </CardTitle>
          <CardDescription>Your basic personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
                disabled={!isEditing}
              >
                <SelectTrigger id="gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nationality">Nationality *</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange("nationality", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-600" />
            Contact Information
          </CardTitle>
          <CardDescription>How we can reach you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="pl-9 bg-muted"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Street Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  disabled={!isEditing}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip/Postal Code *</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            Academic Information
          </CardTitle>
          <CardDescription>Your academic program details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input id="studentId" value={formData.studentId} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollmentDate">Enrollment Date</Label>
              <Input id="enrollmentDate" type="date" value={formData.enrollmentDate} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program *</Label>
              <Select
                value={formData.program}
                onValueChange={(value) => handleInputChange("program", value)}
                disabled={!isEditing}
              >
                <SelectTrigger id="program">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="TVET">TVET</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearOfStudy">Year of Study *</Label>
              <Input
                id="yearOfStudy"
                type="number"
                value={formData.yearOfStudy}
                onChange={(e) => handleInputChange("yearOfStudy", e.target.value)}
                disabled={!isEditing}
              />
              {/* <Select
                value={formData.yearOfStudy}
                onValueChange={(value) => handleInputChange("yearOfStudy", value)}
                disabled={!isEditing}
              >
                <SelectTrigger id="yearOfStudy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Year 1</SelectItem>
                  <SelectItem value="2">Year 2</SelectItem>
                  <SelectItem value="3">Year 3</SelectItem>
                  <SelectItem value="4">Year 4</SelectItem>
                </SelectContent>
              </Select> */}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="expectedGraduation">Expected Graduation Date *</Label>
              <Input
                id="expectedGraduation"
                type="date"
                value={formData.expectedGraduation}
                onChange={(e) => handleInputChange("expectedGraduation", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Emergency Contact
          </CardTitle>
          <CardDescription>Contact person in case of emergency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Full Name *</Label>
              <Input
                id="emergencyName"
                value={formData.emergencyName}
                onChange={(e) => handleInputChange("emergencyName", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyRelation">Relationship *</Label>
              <Select
                value={formData.emergencyRelation}
                onValueChange={(value) => handleInputChange("emergencyRelation", value)}
                disabled={!isEditing}
              >
                <SelectTrigger id="emergencyRelation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Guardian">Guardian</SelectItem>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Sibling">Sibling</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Phone Number *</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyEmail">Email Address</Label>
              <Input
                id="emergencyEmail"
                type="email"
                value={formData.emergencyEmail}
                onChange={(e) => handleInputChange("emergencyEmail", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="mb-20">
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Tell us more about yourself (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Write a short bio about yourself..."
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              disabled={!isEditing}
              className="min-h-24"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

