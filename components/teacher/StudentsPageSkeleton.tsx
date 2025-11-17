import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function StudentsStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24 bg-muted" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 bg-muted mb-2" />
            <Skeleton className="h-3 w-20 bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function StudentsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32 bg-muted mb-2" />
        <Skeleton className="h-4 w-48 bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead><Skeleton className="h-4 w-20 bg-muted" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16 bg-muted" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20 bg-muted" /></TableHead>
                <TableHead><Skeleton className="h-4 w-12 bg-muted" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16 bg-muted" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16 bg-muted" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20 bg-muted" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-16 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 bg-muted" /></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 bg-muted" />
                      <Skeleton className="h-8 w-8 bg-muted" />
                      <Skeleton className="h-8 w-8 bg-muted" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function StudentsPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 bg-muted mb-2" />
          <Skeleton className="h-4 w-64 bg-muted" />
        </div>
        <Skeleton className="h-10 w-32 bg-muted" />
      </div>
      <StudentsStatsSkeleton />
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32 bg-muted" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full bg-muted" />
            </CardContent>
          </Card>
        </div>
        <div className="w-full md:w-48">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-20 bg-muted" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full bg-muted" />
            </CardContent>
          </Card>
        </div>
      </div>
      <StudentsTableSkeleton />
    </div>
  )
}

