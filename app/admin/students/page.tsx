"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { ProtectedLayout } from "@/components/protected-layout"
import { AdminStudentsPageSkeleton } from "@/components/admin/AdminStudentsPageSkeleton"

const AdminStudentsContent = dynamic(
  () => import("./students-content").then((mod) => ({ default: mod.AdminStudentsContent })),
  {
    ssr: false,
    loading: () => <AdminStudentsPageSkeleton />,
  }
)

export default function StudentsPage() {
  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <Suspense fallback={<AdminStudentsPageSkeleton />}>
        <AdminStudentsContent />
      </Suspense>
    </ProtectedLayout>
  )
}
