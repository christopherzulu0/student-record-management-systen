"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { ErrorBoundary } from "react-error-boundary"
import { ProtectedLayout } from "@/components/protected-layout"
import { StudentProfilePageSkeleton } from "@/components/student/StudentProfilePageSkeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, UserPlus } from "lucide-react"

// Dynamically import the content component to prevent SSR
const StudentProfilePageContent = dynamic(
  () => import("./profile-content").then((mod) => ({ default: mod.StudentProfilePageContent })),
  {
    ssr: false,
    loading: () => <StudentProfilePageSkeleton />,
  }
)

function ProfileErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error
  resetErrorBoundary: () => void 
}) {
  const isStudentNotFound = error.message.includes("Student record not found") || 
                            error.message.includes("student record not found")

  return (
    <div className="p-6 max-w-5xl">
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <CardTitle className="text-destructive">Profile Setup Required</CardTitle>
          </div>
          <CardDescription>
            {isStudentNotFound 
              ? "Your student profile needs to be set up before you can access this page."
              : "We encountered an issue loading your profile."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isStudentNotFound ? (
            <>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Student Profile Not Found
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      It looks like your student profile hasn't been created yet. Please contact your administrator 
                      to set up your student profile, or wait for your profile to be created automatically.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={resetErrorBoundary} variant="outline">
                  Try Again
                </Button>
                <Button onClick={() => window.location.href = "/dashboard"} variant="default">
                  Go to Dashboard
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {error.message || "An unexpected error occurred while loading your profile."}
              </p>
              <div className="flex gap-2">
                <Button onClick={resetErrorBoundary} variant="outline">
                  Try Again
                </Button>
                <Button onClick={() => window.location.reload()} variant="default">
                  Refresh Page
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedLayout allowedRoles={["student"]}>
      <ErrorBoundary 
        FallbackComponent={ProfileErrorFallback}
        onError={(error) => {
          console.error("Profile page error:", error)
        }}
      >
        <Suspense fallback={<StudentProfilePageSkeleton />}>
          <StudentProfilePageContent />
        </Suspense>
      </ErrorBoundary>
    </ProtectedLayout>
  )
}
