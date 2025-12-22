"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { ProtectedLayout } from "@/components/protected-layout"
import { StudentDocumentsPageSkeleton } from "@/components/student/StudentDocumentsPageSkeleton"

const DocumentsContent = dynamic(
  () => import("./documents-content").then((mod) => ({ default: mod.DocumentsContent })),
  {
    ssr: false,
    loading: () => <StudentDocumentsPageSkeleton />,
  }
)

export default function DocumentsPage() {
  return (
    <ProtectedLayout allowedRoles={["student"]}>
      <Suspense fallback={<StudentDocumentsPageSkeleton />}>
        <DocumentsContent />
      </Suspense>
    </ProtectedLayout>
  )
}
