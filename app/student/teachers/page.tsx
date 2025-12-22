"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { ProtectedLayout } from "@/components/protected-layout"
import { StudentTeachersPageSkeleton } from "@/components/student/StudentTeachersPageSkeleton"

const TeachersContent = dynamic(
  () => import("./teachers-content").then((mod) => ({ default: mod.TeachersContent })),
  {
    ssr: false,
    loading: () => <StudentTeachersPageSkeleton />,
  }
)

export default function TeachersPage() {
  return (
    <ProtectedLayout allowedRoles={["student"]}>
      <Suspense fallback={<StudentTeachersPageSkeleton />}>
        <TeachersContent />
      </Suspense>
    </ProtectedLayout>
  )
}
