"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { ErrorBoundary } from "react-error-boundary"
import { ProtectedLayout } from "@/components/protected-layout"
import { RecommendationSkeleton } from "@/components/skeletons/recommendation-skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

// Dynamically import the content component to prevent SSR
const RecommendationsContent = dynamic(
  () => import("./recommendations-content").then((mod) => ({ default: mod.RecommendationsContent })),
  {
    ssr: false,
    loading: () => <RecommendationSkeleton />,
  }
)

function RecommendationsErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error
  resetErrorBoundary: () => void 
}) {
  const isUnauthorized = error.message.includes("Unauthorized") || 
                         error.message.includes("Please login")

  return (
    <div className="p-6 max-w-5xl">
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <CardTitle className="text-destructive">
              {isUnauthorized ? "Authentication Required" : "Error Loading Recommendations"}
            </CardTitle>
          </div>
          <CardDescription>
            {isUnauthorized 
              ? "Please log in to view your recommendation requests."
              : "We encountered an issue loading your recommendations."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isUnauthorized ? (
            <>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You need to be logged in as a teacher to access recommendation requests. 
                  Please log in and try again.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => window.location.href = "/sign-in"} variant="default">
                  Go to Login
                </Button>
                <Button onClick={resetErrorBoundary} variant="outline">
                  Try Again
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {error.message || "An unexpected error occurred while loading recommendations."}
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

export default function TeacherRecommendationsPage() {
  return (
    <ProtectedLayout allowedRoles={["teacher"]}>
      <ErrorBoundary 
        FallbackComponent={RecommendationsErrorFallback}
        onError={(error) => {
          console.error("Recommendations page error:", error)
        }}
      >
      <Suspense fallback={<RecommendationSkeleton />}>
        <RecommendationsContent />
      </Suspense>
      </ErrorBoundary>
    </ProtectedLayout>
  )
}
