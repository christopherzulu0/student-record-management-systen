"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { ProtectedLayout } from "@/components/protected-layout"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { ErrorBoundary } from "react-error-boundary"


// Dynamically import the dashboard content to prevent SSR
const DashboardContent = dynamic(
  () => import("./dashboard-content").then((mod) => mod.DashboardContent),
  {
    ssr: false,
    loading: () => <DashboardSkeleton />,
  }
)

function ErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error
  resetErrorBoundary: () => void 
}) {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <p className="text-destructive text-lg font-semibold mb-2">{error.message}</p>
        <p className="text-muted-foreground mb-4">Please try logging in again</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
  <>
   
    <ProtectedLayout>
      <ErrorBoundary 
        FallbackComponent={ErrorFallback}
        onError={(error) => {
          console.error("Dashboard error:", error)
        }}
      >
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </ErrorBoundary>
    </ProtectedLayout>
  </>
  )
}
