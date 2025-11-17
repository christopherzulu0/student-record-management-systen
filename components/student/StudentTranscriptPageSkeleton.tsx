import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function StudentTranscriptPageSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 bg-muted mb-2" />
          <Skeleton className="h-4 w-64 bg-muted" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 bg-muted" />
          <Skeleton className="h-10 w-24 bg-muted" />
          <Skeleton className="h-10 w-32 bg-muted" />
        </div>
      </div>

      {/* Student Info Card Skeleton */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-7 w-40 bg-muted mb-2" />
                <Skeleton className="h-4 w-32 bg-muted" />
              </div>
              <Skeleton className="h-6 w-28 bg-muted" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
                  <Skeleton className="h-3 w-20 bg-muted mb-2" />
                  <Skeleton className="h-5 w-24 bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters Card Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-6 w-32 bg-muted mb-2" />
              <Skeleton className="h-4 w-48 bg-muted" />
            </div>
            <Skeleton className="h-9 w-20 bg-muted" />
          </div>
        </CardHeader>
      </Card>

      {/* Semester Cards Skeleton */}
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-6 w-32 bg-muted mb-2" />
                <Skeleton className="h-4 w-24 bg-muted" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-4 w-20 bg-muted" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24 bg-muted" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-16 bg-muted" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-16 bg-muted" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-12 bg-muted" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton className="h-4 w-16 bg-muted" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 bg-muted" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 bg-muted" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 bg-muted" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 bg-muted" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Pagination Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-48 bg-muted" />
            <Skeleton className="h-10 w-64 bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Academic Standing Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-muted" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full bg-muted" />
          <Skeleton className="h-4 w-full bg-muted" />
        </CardContent>
      </Card>
    </div>
  )
}

