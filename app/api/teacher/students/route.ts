import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch teacher's students
export async function GET() {
  try {
    // Get authenticated user from Clerk session
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No user in session' },
        { status: 401 }
      )
    }

    // Verify user is teacher
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { 
        id: true,
        role: true,
      },
    })

    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Forbidden - Teacher access required' },
        { status: 403 }
      )
    }

    // Get teacher record
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher record not found' },
        { status: 404 }
      )
    }

    // Fetch teacher's courses
    const courses = await prisma.course.findMany({
      where: {
        teacherId: teacher.id,
        status: 'active',
      },
      select: {
        id: true,
      },
    })

    const courseIds = courses.map(c => c.id)

    if (courseIds.length === 0) {
      return NextResponse.json({
        students: [],
        statistics: {
          total: 0,
          excellent: 0,
          goodStanding: 0,
          atRisk: 0,
        },
      })
    }

    // Fetch enrollments for teacher's courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: { in: courseIds },
        status: 'enrolled',
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      distinct: ['studentId'],
    })

    // Get unique student IDs
    const studentIds = [...new Set(enrollments.map(e => e.student.id))]

    // Fetch student details with grades
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        grades: {
          where: {
            courseId: { in: courseIds },
          },
          select: {
            score: true,
            courseId: true,
          },
        },
        documents: {
          select: {
            id: true,
            name: true,
            description: true,
            required: true,
            status: true,
            uploadedDate: true,
            fileName: true,
            fileSize: true,
          },
        },
      },
    })

    // Format students data
    const formattedStudents = students.map(student => {
      // Calculate average grade from teacher's courses
      const courseGrades = student.grades.filter(g => courseIds.includes(g.courseId))
      const avgScore = courseGrades.length > 0
        ? courseGrades.reduce((sum, g) => sum + g.score, 0) / courseGrades.length
        : 0

      // Convert score to GPA (assuming 0-100 scale, convert to 0-4 scale)
      const gpa = (avgScore / 100) * 4

      // Determine grade letter
      const getGradeLetter = (score: number): string => {
        if (score >= 97) return 'A+'
        if (score >= 93) return 'A'
        if (score >= 90) return 'A-'
        if (score >= 87) return 'B+'
        if (score >= 83) return 'B'
        if (score >= 80) return 'B-'
        if (score >= 77) return 'C+'
        if (score >= 73) return 'C'
        if (score >= 70) return 'C-'
        if (score >= 67) return 'D+'
        if (score >= 63) return 'D'
        if (score >= 60) return 'D-'
        return 'F'
      }

      const grade = getGradeLetter(avgScore)

      // Determine status
      let status = 'Good Standing'
      let trend = 'stable'
      if (gpa >= 3.5) {
        status = 'Excellent'
        trend = 'up'
      } else if (gpa < 3.0) {
        status = 'At Risk'
        trend = 'down'
      }

      // Format documents
      const documents = student.documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        description: doc.description || '',
        required: doc.required,
        status: doc.status.toLowerCase() as 'pending' | 'uploaded' | 'approved' | 'rejected' | 'expired',
        uploadedDate: doc.uploadedDate?.toISOString(),
        fileName: doc.fileName || undefined,
        fileSize: doc.fileSize || undefined,
        fileUrl: doc.fileUrl || undefined,
        rejectionReason: doc.rejectionReason || undefined,
      }))

      return {
        id: student.studentId,
        name: `${student.user.firstName} ${student.user.lastName}`.trim(),
        email: student.user.email,
        gpa: student.cumulativeGPA || gpa,
        grade,
        status,
        trend,
        documents,
      }
    })

    // Calculate statistics
    const total = formattedStudents.length
    const excellent = formattedStudents.filter(s => s.gpa >= 3.5).length
    const atRisk = formattedStudents.filter(s => s.gpa < 3.0).length
    const goodStanding = total - excellent - atRisk

    return NextResponse.json({
      students: formattedStudents,
      statistics: {
        total,
        excellent,
        goodStanding,
        atRisk,
      },
    })
  } catch (error) {
    console.error('[API] Error fetching teacher students:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

