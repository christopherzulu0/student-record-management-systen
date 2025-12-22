"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { ProtectedLayout } from "@/components/protected-layout"
import { StudentsPageSkeleton } from "@/components/teacher/StudentsPageSkeleton"

// Dynamically import the content component to prevent SSR
const MyStudentsPageContent = dynamic(
  () => import("./students-content").then((mod) => ({ default: mod.MyStudentsPageContent })),
  {
    ssr: false,
    loading: () => <StudentsPageSkeleton />,
  }
)

export default function MyStudentsPage() {
  return (
    <ProtectedLayout allowedRoles={["teacher"]}>
      <Suspense fallback={<StudentsPageSkeleton />}>
        <MyStudentsPageContent />
      </Suspense>
    </ProtectedLayout>
  )
}
