"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { ProtectedLayout } from "@/components/protected-layout"
import { GradesPageSkeleton } from "@/components/teacher/GradesPageSkeleton"

// Dynamically import the content component to prevent SSR
const TeacherGradesPageContent = dynamic(
  () => import("./grades-content").then((mod) => ({ default: mod.TeacherGradesPageContent })),
  {
    ssr: false,
    loading: () => <GradesPageSkeleton />,
  }
)

export default function TeacherGradesPage() {
  return (
    <ProtectedLayout allowedRoles={["teacher"]}>
      <Suspense fallback={<GradesPageSkeleton />}>
        <TeacherGradesPageContent />
      </Suspense>
    </ProtectedLayout>
  )
}
