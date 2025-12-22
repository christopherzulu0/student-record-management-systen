"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { ProtectedLayout } from "@/components/protected-layout"
import { StudentTranscriptPageSkeleton } from "@/components/student/StudentTranscriptPageSkeleton"

// Dynamically import the content component to prevent SSR
const StudentTranscriptPageContent = dynamic(
  () => import("./transcript-content").then((mod) => ({ default: mod.StudentTranscriptPageContent })),
  {
    ssr: false,
    loading: () => <StudentTranscriptPageSkeleton />,
  }
)

export default function TranscriptPage() {
  return (
    <ProtectedLayout allowedRoles={["student"]}>
      <Suspense fallback={<StudentTranscriptPageSkeleton />}>
        <StudentTranscriptPageContent />
      </Suspense>
    </ProtectedLayout>
  )
}
