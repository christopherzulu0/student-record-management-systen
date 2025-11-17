"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { ProtectedLayout } from "@/components/protected-layout"
import { StudentGradesPageSkeleton } from "@/components/student/StudentGradesPageSkeleton"

// Dynamically import the content component to prevent SSR
const StudentGradesPageContent = dynamic(
  () => import("./grades-content").then((mod) => ({ default: mod.StudentGradesPageContent })),
  {
    ssr: false,
    loading: () => <StudentGradesPageSkeleton />,
  }
)

export default function GradesPage() {
  return (
    <ProtectedLayout allowedRoles={["student"]}>
      <Suspense fallback={<StudentGradesPageSkeleton />}>
        <StudentGradesPageContent />
      </Suspense>
    </ProtectedLayout>
  )
}
