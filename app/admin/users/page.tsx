"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { ProtectedLayout } from "@/components/protected-layout"
import { AdminUsersPageSkeleton } from "@/components/admin/AdminUsersPageSkeleton"

const AdminUsersContent = dynamic(
  () => import("./users-content").then((mod) => ({ default: mod.AdminUsersContent })),
  {
    ssr: false,
    loading: () => <AdminUsersPageSkeleton />,
  }
)

export default function UsersPage() {
  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <Suspense fallback={<AdminUsersPageSkeleton />}>
        <AdminUsersContent />
      </Suspense>
    </ProtectedLayout>
  )
}
