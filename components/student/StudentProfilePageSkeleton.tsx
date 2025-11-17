import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StudentProfilePageSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 bg-muted mb-2" />
          <Skeleton className="h-4 w-96 bg-muted" />
        </div>
        <Skeleton className="h-10 w-32 bg-muted" />
      </div>

      {/* Profile Completion Card Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-32 bg-muted mb-2" />
              <Skeleton className="h-4 w-48 bg-muted" />
            </div>
            <div className="text-right">
              <Skeleton className="h-8 w-16 bg-muted mb-2" />
              <Skeleton className="h-3 w-20 bg-muted" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-3 w-full bg-muted rounded-full" />
          <Skeleton className="h-4 w-64 bg-muted mt-3" />
        </CardContent>
      </Card>

      {/* Personal Information Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-muted mb-2" />
          <Skeleton className="h-4 w-48 bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24 bg-muted" />
                <Skeleton className="h-10 w-full bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-muted mb-2" />
          <Skeleton className="h-4 w-48 bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24 bg-muted" />
                <Skeleton className="h-10 w-full bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Academic Information Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-muted mb-2" />
          <Skeleton className="h-4 w-48 bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24 bg-muted" />
                <Skeleton className="h-10 w-full bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-muted mb-2" />
          <Skeleton className="h-4 w-48 bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24 bg-muted" />
                <Skeleton className="h-10 w-full bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Information Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-muted mb-2" />
          <Skeleton className="h-4 w-48 bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16 bg-muted" />
            <Skeleton className="h-24 w-full bg-muted" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

