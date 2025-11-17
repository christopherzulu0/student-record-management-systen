import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TeacherStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card
          key={index}
          className="border-none bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 shadow-lg overflow-hidden"
        >
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-24 bg-white/20 dark:bg-white/10" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 bg-white/20 dark:bg-white/10 mb-2" />
            <Skeleton className="h-3 w-20 bg-white/20 dark:bg-white/10" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function TeacherChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-none shadow-lg">
        <CardHeader>
          <Skeleton className="h-5 w-48 bg-muted mb-2" />
          <Skeleton className="h-4 w-32 bg-muted" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full bg-muted" />
        </CardContent>
      </Card>
      <Card className="border-none shadow-lg">
        <CardHeader>
          <Skeleton className="h-5 w-32 bg-muted" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full bg-muted" />
        </CardContent>
      </Card>
    </div>
  )
}

export function TeacherContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="border-none shadow-lg">
          <CardHeader>
            <Skeleton className="h-5 w-32 bg-muted" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="p-3 border rounded-lg">
                <Skeleton className="h-4 w-24 bg-muted mb-2" />
                <Skeleton className="h-3 w-full bg-muted mb-2" />
                <Skeleton className="h-2 w-full bg-muted" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

