"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { ProtectedLayout } from "@/components/protected-layout"
import { AdminReportsPageSkeleton } from "@/components/admin/AdminReportsPageSkeleton"

const AdminReportsContent = dynamic(
  () => import("./reports-content").then((mod) => ({ default: mod.AdminReportsContent })),
  {
    ssr: false,
    loading: () => <AdminReportsPageSkeleton />,
  }
)

export default function ReportsPage() {
  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <Suspense fallback={<AdminReportsPageSkeleton />}>
        <AdminReportsContent />
      </Suspense>
    </ProtectedLayout>
  )
}
