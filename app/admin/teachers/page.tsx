"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { ProtectedLayout } from "@/components/protected-layout"
import { AdminTeachersPageSkeleton } from "@/components/admin/AdminTeachersPageSkeleton"

const AdminTeachersContent = dynamic(
  () => import("./teachers-content").then((mod) => ({ default: mod.AdminTeachersContent })),
  {
    ssr: false,
    loading: () => <AdminTeachersPageSkeleton />,
  }
)

export default function TeachersPage() {
  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <Suspense fallback={<AdminTeachersPageSkeleton />}>
        <AdminTeachersContent />
      </Suspense>
    </ProtectedLayout>
  )
}
