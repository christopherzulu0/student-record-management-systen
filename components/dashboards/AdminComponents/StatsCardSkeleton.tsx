import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function StatsCardSkeleton() {
  return (
    <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-5 w-full">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card
          key={index}
          className="border-none bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 shadow-lg overflow-hidden"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-3 p-4 md:p-6">
            <Skeleton className="h-3 md:h-4 w-20 md:w-24 bg-white/20 dark:bg-white/10" />
            <Skeleton className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-white/20 dark:bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-1 p-4 md:p-6 pt-0">
            <Skeleton className="h-6 md:h-8 w-12 md:w-16 bg-white/20 dark:bg-white/10" />
            <Skeleton className="h-3 w-16 md:w-20 bg-white/20 dark:bg-white/10" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

