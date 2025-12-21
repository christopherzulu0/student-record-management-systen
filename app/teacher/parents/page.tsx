"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { ProtectedLayout } from "@/components/protected-layout"
import { StudentsPageSkeleton } from "@/components/teacher/StudentsPageSkeleton"

// Dynamically import the content component to prevent SSR
const ParentsPageContent = dynamic(
  () => import("./parents-content").then((mod) => ({ default: mod.ParentsPageContent })),
  {
    ssr: false,
    loading: () => <StudentsPageSkeleton />,
  }
)

export default function ParentsPage() {
  return (
    <ProtectedLayout allowedRoles={["teacher"]}>
      <Suspense fallback={<StudentsPageSkeleton />}>
        <ParentsPageContent />
      </Suspense>
    </ProtectedLayout>
  )
}

