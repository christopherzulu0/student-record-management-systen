"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Trash2,
  Edit,
  User,
  Users,
  GraduationCap,
  BookOpen,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAdminUsers, type AdminUser } from "@/lib/hooks/use-admin-users"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function AdminUsersContent() {
  const { data } = useAdminUsers()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [roleFilter, setRoleFilter] = useState<string>("all")

  // Action states
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [viewingProfileUser, setViewingProfileUser] = useState<AdminUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    role: "",
    status: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const filteredUsers = data.users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || u.role === roleFilter

    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "teacher":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      case "admin":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student":
        return <GraduationCap className="w-4 h-4" />
      case "teacher":
        return <BookOpen className="w-4 h-4" />
      case "admin":
        return <Shield className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      toast.error("No users to export")
      return
    }

    const headers = ["User ID", "Name", "Email", "Role", "Status", "Created Date"]
    const rows = filteredUsers.map((user) => {
      return [user.id, user.name, user.email, user.role, user.status, new Date(user.createdAt).toLocaleDateString()]
    })

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const metadata = [
      `Export Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      `Total Users: ${filteredUsers.length}`,
      `Students: ${data.statistics.students}`,
      `Teachers: ${data.statistics.teachers}`,
      `Admins: ${data.statistics.admins}`,
      "",
    ]

    const fullCSV = [...metadata, csvContent].join("\n")
    const blob = new Blob([fullCSV], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `users_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Users exported successfully!")
  }

  const handleViewProfile = async (user: AdminUser) => {
    setViewingProfileUser(user)
    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/admin/users/${user.userId}`)
      if (!response.ok) throw new Error("Failed to fetch user details")
      const data = await response.json()
      setUserDetails(data.user)
    } catch (error) {
      toast.error("Failed to load user profile")
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleEdit = async (user: AdminUser) => {
    setEditingUser(user)
    setEditFormData({
      role: user.role,
      status: user.status,
    })

    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/admin/users/${user.userId}`)
      if (!response.ok) throw new Error("Failed to fetch user details")
      const data = await response.json()
      setUserDetails(data.user)
      setEditFormData({
        role: data.user.role,
        status: data.user.status,
      })
    } catch (error) {
      toast.error("Failed to load user details")
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/users/${editingUser.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: editFormData.role,
          status: editFormData.status,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update user")
      }

      toast.success("User updated successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      setEditingUser(null)
      setEditFormData({ role: "", status: "" })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingUser) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/users/${deletingUser.userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete user")
      }

      toast.success("User deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      setDeletingUser(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`)) {
      return
    }

    try {
      const usersToDelete = data.users.filter((u) => selectedUsers.includes(u.id))

      await Promise.all(
        usersToDelete.map((user) =>
          fetch(`/api/admin/users/${user.userId}`, {
            method: "DELETE",
          }),
        ),
      )

      toast.success(`${selectedUsers.length} user(s) deleted successfully`)
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      setSelectedUsers([])
    } catch (error) {
      toast.error("Failed to delete some users")
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Users
          </h1>
          <p className="text-muted-foreground mt-2">Manage {data.statistics.total} user accounts across all roles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>Create a new user account in the system</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input placeholder="Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="john@university.edu" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                onClick={() => setIsDialogOpen(false)}
              >
                Create User
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                <Users className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {data.statistics.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All accounts</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              {data.statistics.students}
            </div>
            <p className="text-xs text-blue-600 mt-1">Enrolled learners</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Teachers</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              {data.statistics.teachers}
            </div>
            <p className="text-xs text-purple-600 mt-1">Faculty members</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
              {data.statistics.admins}
            </div>
            <p className="text-xs text-amber-600 mt-1">System administrators</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced search and filter section */}
      <Card className="border-2 border-emerald-100 dark:border-emerald-900/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-600" />
            Find Users
          </CardTitle>
          <CardDescription>Search and filter by name, email, or role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10 h-12 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-12">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={filteredUsers.length === 0}
              className="border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950 bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {selectedUsers.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                Delete {selectedUsers.length}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card className="mb-20">
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>Total: {filteredUsers.length} users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2">
                  <TableHead className="w-12">
                    <input type="checkbox" className="rounded border" />
                  </TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          className="rounded border"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id])
                            } else {
                              setSelectedUsers(selectedUsers.filter((id) => id !== user.id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm font-semibold">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleColor(user.role)} flex items-center gap-1 w-fit border`}>
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewProfile(user)}>
                              <User className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => setDeletingUser(user)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-12 h-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground font-medium">No users found</p>
                        <p className="text-sm text-muted-foreground">
                          {searchTerm ? "Try adjusting your search criteria" : "No users in the system"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUser(null)
            setEditFormData({ role: "", status: "" })
            setUserDetails(null)
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>Update user information and permissions</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input value={editingUser.id} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={editingUser.name} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={editingUser.email} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setEditingUser(null)
                    setEditFormData({ role: "", status: "" })
                    setUserDetails(null)
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  disabled={isSaving || !editFormData.role}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog
        open={!!viewingProfileUser}
        onOpenChange={(open) => {
          if (!open) {
            setViewingProfileUser(null)
            setUserDetails(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle>User Profile</DialogTitle>
                <DialogDescription>
                  {viewingProfileUser?.name} ({viewingProfileUser?.id})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(85vh-120px)]">
            {isLoadingDetails ? (
              <div className="mt-6 space-y-4 px-1">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
              </div>
            ) : userDetails ? (
              <div className="mt-6 space-y-6 px-1">
                <Card className="border-2">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="w-5 h-5 text-emerald-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="font-medium">{userDetails.email}</p>
                    </div>
                    {userDetails.phone && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <p className="font-medium">{userDetails.phone}</p>
                      </div>
                    )}
                    {userDetails.address && (
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Address
                        </Label>
                        <p className="font-medium">
                          {userDetails.address}
                          {userDetails.city && `, ${userDetails.city}`}
                          {userDetails.state && `, ${userDetails.state}`}
                          {userDetails.zipCode && ` ${userDetails.zipCode}`}
                          {userDetails.country && `, ${userDetails.country}`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">First Name</Label>
                        <p className="font-medium">{userDetails.firstName}</p>
                      </div>
                      {userDetails.lastName && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Last Name</Label>
                          <p className="font-medium">{userDetails.lastName}</p>
                        </div>
                      )}
                    </div>
                    {userDetails.dateOfBirth && (
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Date of Birth
                        </Label>
                        <p className="font-medium">{new Date(userDetails.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                    )}
                    {userDetails.gender && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Gender</Label>
                        <p className="font-medium">{userDetails.gender}</p>
                      </div>
                    )}
                    {userDetails.nationality && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Nationality</Label>
                        <p className="font-medium">{userDetails.nationality}</p>
                      </div>
                    )}
                    {userDetails.bio && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Bio</Label>
                        <p className="font-medium text-sm">{userDetails.bio}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-600" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Role</Label>
                        <Badge className={`${getRoleColor(userDetails.role)} mt-1`}>{userDetails.role}</Badge>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <Badge variant="outline" className="mt-1">
                          {userDetails.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Created At</Label>
                      <p className="font-medium">{new Date(userDetails.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Last Updated</Label>
                      <p className="font-medium">{new Date(userDetails.updatedAt).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                {(userDetails.emergencyContactName || userDetails.emergencyContactNumber) && (
                  <Card className="border-2">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Phone className="w-5 h-5 text-red-600" />
                        Emergency Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      {userDetails.emergencyContactName && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Name</Label>
                          <p className="font-medium">{userDetails.emergencyContactName}</p>
                        </div>
                      )}
                      {userDetails.emergencyContactNumber && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Phone</Label>
                          <p className="font-medium">{userDetails.emergencyContactNumber}</p>
                        </div>
                      )}
                      {userDetails.emergencyContactRelation && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Relation</Label>
                          <p className="font-medium">{userDetails.emergencyContactRelation}</p>
                        </div>
                      )}
                      {userDetails.emergencyContactEmail && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Email</Label>
                          <p className="font-medium">{userDetails.emergencyContactEmail}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deletingUser?.name} ({deletingUser?.id}) and all associated records. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
