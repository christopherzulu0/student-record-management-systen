"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export interface SemesterTrend {
  semester: string
  avgAverage: number
  enrolled: number
  graduated: number
}

export interface DepartmentStat {
  dept: string
  students: number
  avgAverage: number
  passRate: number
}

export interface AtRiskStudent {
  id: string
  name: string
  average: number
  status: "At Risk" | "Critical"
}

export interface AdminReportsData {
  overview: {
    systemAverage: number
    passRate: number
    graduationRate: number
    atRiskCount: number
  }
  semesterTrends: SemesterTrend[]
  departments: DepartmentStat[]
  atRiskStudents: AtRiskStudent[]
}

async function fetchAdminReports(): Promise<AdminReportsData> {
  if (typeof window === "undefined") {
    throw new Error("fetchAdminReports can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/admin/reports`, {
    credentials: "include",
  })

  if (!response.ok) {
    let errorData: any = {}
    const contentType = response.headers.get("content-type")
    
    try {
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json()
      } else {
        const text = await response.text()
        errorData = { error: text || `HTTP ${response.status}: ${response.statusText}` }
      }
    } catch (parseError) {
      console.error("[useAdminReports] Failed to parse error response:", parseError)
      errorData = { 
        error: `HTTP ${response.status}: ${response.statusText}`,
        parseError: parseError instanceof Error ? parseError.message : String(parseError)
      }
    }
    
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error("Forbidden - Admin access required")
    }
    
    const errorMessage = errorData.error || errorData.details || "Failed to fetch reports"
    console.error("[useAdminReports] API Error:", {
      status: response.status,
      statusText: response.statusText,
      error: errorMessage,
      errorData: errorData,
      url: `${baseUrl}/api/admin/reports`,
    })
    throw new Error(errorMessage)
  }

  return response.json()
}

export function useAdminReports() {
  return useSuspenseQuery({
    queryKey: ["admin-reports"],
    queryFn: fetchAdminReports,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

