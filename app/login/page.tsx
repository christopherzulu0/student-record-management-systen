"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { User } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  const handleSelectUser = (role: "student" | "teacher" | "admin") => {
    let selectedUser
    
    if (role === "admin") {
      selectedUser = db.users.findByEmail("admin@university.edu")
    } else if (role === "teacher") {
      selectedUser = db.users.findByEmail("teacher@university.edu")
    } else {
      selectedUser = db.users.findByEmail("student@university.edu")
    }

    if (selectedUser) {
      // Store user in localStorage directly
      localStorage.setItem("current_user", JSON.stringify(selectedUser))
      router.push("/dashboard")
    }
  }

  const roles = [
    { role: "admin" as const, email: "admin@university.edu", name: "Admin User", description: "Full system access" },
    { role: "teacher" as const, email: "teacher@university.edu", name: "Dr. Jane Smith", description: "Manage students and grades" },
    { role: "student" as const, email: "student@university.edu", name: "John Doe", description: "View your academic records" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center text-white space-y-2">
          <h1 className="text-4xl font-bold">SARMS</h1>
          <p className="text-lg opacity-90">Student Academic Record Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select User Role</CardTitle>
            <CardDescription>Choose a role to access the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {roles.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleSelectUser(account.role)}
                  className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <div className="p-2 rounded-md bg-primary/10">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{account.name}</p>
                    <p className="text-xs text-gray-600">{account.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">{account.description}</p>
                  </div>
                  <div className="text-xs font-medium text-primary uppercase">{account.role}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
