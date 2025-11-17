import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function StudentGradesPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 bg-muted mb-2" />
          <Skeleton className="h-4 w-64 bg-muted" />
        </div>
        <Skeleton className="h-10 w-24 bg-muted" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-24 bg-muted" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 bg-muted mb-2" />
              <Skeleton className="h-3 w-20 bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-muted mb-2" />
          <Skeleton className="h-4 w-64 bg-muted" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full bg-muted" />
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-6 w-32 bg-muted mb-2" />
              <Skeleton className="h-4 w-48 bg-muted" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-40 bg-muted" />
              <Skeleton className="h-9 w-20 bg-muted" />
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
                <TableHead><Skeleton className="h-4 w-12 bg-muted" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16 bg-muted" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20 bg-muted" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-16 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 bg-muted" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-2 py-4">
            <Skeleton className="h-4 w-48 bg-muted" />
            <Skeleton className="h-10 w-64 bg-muted" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

