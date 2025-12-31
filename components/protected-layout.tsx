"use client"

import { useRouter } from "next/navigation"
import { useUser } from "@/lib/hooks/use-user"
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import { Sidebar } from "@/components/sidebar"

interface ProtectedLayoutProps {
  children: React.ReactNode
  allowedRoles?: ("student" | "teacher" | "admin" | "parent")[]
}

function AuthErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error
  resetErrorBoundary: () => void 
}) {
  const router = useRouter()
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-6">
        <h1 className="text-2xl font-bold text-destructive mb-2">Authentication Required</h1>
        <p className="text-muted-foreground mb-4">
          {error.message || "Please log in to access this page"}
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  )
}

function ProtectedContent({ children, allowedRoles }: ProtectedLayoutProps) {
  const router = useRouter()
  // useSuspenseQuery will suspend until data is available, so we don't need to check isLoading
  const { data: user } = useUser()

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role as "student" | "teacher" | "admin" | "parent")) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-6">
            <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page. Required role: {allowedRoles.join(" or ")}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )
    }
  }

  // User is authenticated and has the required role (if specified)
  // Render sidebar and content in a flex layout
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

export function ProtectedLayout({ children, allowedRoles }: ProtectedLayoutProps) {
  return (
    <ErrorBoundary
      FallbackComponent={AuthErrorFallback}
      onError={(error) => {
        console.error("ProtectedLayout error:", error)
      }}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        }
      >
        <ProtectedContent allowedRoles={allowedRoles}>
          {children}
        </ProtectedContent>
      </Suspense>
    </ErrorBoundary>
  )
}

