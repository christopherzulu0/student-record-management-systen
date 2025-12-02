import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminOverviewSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Recent Activity and Alerts */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 w-full">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm md:text-base">
              <Skeleton className="h-5 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <div className="space-y-3 md:space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-2 md:gap-3 pb-3 border-b last:border-b-0">
                  <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm md:text-base">
              <Skeleton className="h-5 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-2 md:p-3 rounded-lg border">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-8 w-20 ml-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 w-full">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm md:text-base">
              <Skeleton className="h-5 w-32" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-24 mt-1" />
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Skeleton className="w-full h-[250px]" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm md:text-base">
              <Skeleton className="h-5 w-32" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-24 mt-1" />
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Skeleton className="w-full h-[250px]" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 w-full">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm md:text-base">
              <Skeleton className="h-5 w-32" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-24 mt-1" />
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Skeleton className="w-full h-[250px]" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm md:text-base">
              <Skeleton className="h-5 w-32" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-24 mt-1" />
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Skeleton className="w-full h-[250px]" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

