import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch students with their parents
export async function GET() {
  try {
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
    const teacherCourses = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      select: { id: true },
    })

    const courseIds = teacherCourses.map(c => c.id)

    // Fetch students enrolled in teacher's courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: { in: courseIds },
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
                phone: true,
              },
            },
            parentStudents: {
              include: {
                parent: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      distinct: ['studentId'],
    })

    // Fetch all grades for calculating averages
    const allGrades = await prisma.grade.findMany({
      where: {
        studentId: { in: enrollments.map(e => e.student.id) },
      },
      select: {
        studentId: true,
        score: true,
      },
    })

    // Group grades by student
    const gradesByStudent = new Map<string, number[]>()
    allGrades.forEach(grade => {
      if (grade.score > 0) {
        if (!gradesByStudent.has(grade.studentId)) {
          gradesByStudent.set(grade.studentId, [])
        }
        gradesByStudent.get(grade.studentId)!.push(grade.score)
      }
    })

    // Format students with their parents
    const students = enrollments.map(enrollment => {
      const student = enrollment.student
      const parents = student.parentStudents.map(ps => ({
        id: ps.id,
        parentId: ps.parent.id,
        parentDisplayId: ps.parent.parentId,
        parentUserId: ps.parent.userId,
        firstName: ps.parent.user.firstName,
        lastName: ps.parent.user.lastName,
        email: ps.parent.user.email,
        phone: ps.parent.user.phone,
        relationship: ps.relationship || ps.parent.relationship,
        isPrimary: ps.isPrimary,
        canViewGrades: ps.canViewGrades,
        canViewAttendance: ps.canViewAttendance,
        canViewDocuments: ps.canViewDocuments,
      }))

      // Calculate average from grades
      const studentGrades = gradesByStudent.get(student.id) || []
      const average = studentGrades.length > 0
        ? Number((studentGrades.reduce((sum, score) => sum + score, 0) / studentGrades.length).toFixed(2))
        : (student.cumulativeGPA || 0)

      return {
        id: student.id,
        studentId: student.studentId,
        userId: student.userId,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        email: student.user.email,
        phone: student.user.phone,
        program: student.program,
        yearOfStudy: student.yearOfStudy,
        average,
        status: student.status,
        parents,
      }
    })

    return NextResponse.json({
      students,
      statistics: {
        total: students.length,
        withParents: students.filter(s => s.parents.length > 0).length,
        withoutParents: students.filter(s => s.parents.length === 0).length,
      },
    })
  } catch (error) {
    console.error('[API] Error fetching students with parents:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST - Add parent to student
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { studentId, parentEmail, relationship, isPrimary, canViewGrades, canViewAttendance, canViewDocuments } = body

    if (!studentId || !parentEmail) {
      return NextResponse.json(
        { error: 'Student ID and parent email are required' },
        { status: 400 }
      )
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Find or create parent user
    let parentUser = await prisma.user.findUnique({
      where: { email: parentEmail },
      include: { parent: true },
    })

    if (!parentUser) {
      return NextResponse.json(
        { error: 'Parent user not found. Please ensure the parent has registered with this email.' },
        { status: 404 }
      )
    }

    // Check if user has parent role
    if (parentUser.role !== 'parent') {
      return NextResponse.json(
        { error: 'User is not registered as a parent' },
        { status: 400 }
      )
    }

    // Get or create parent record
    let parent = parentUser.parent
    if (!parent) {
      // Generate unique parentId
      const generateParentId = async (): Promise<string> => {
        let counter = 1
        let newParentId: string
        let exists = true

        while (exists) {
          newParentId = `PAR${String(counter).padStart(4, '0')}`
          const existing = await prisma.parent.findUnique({
            where: { parentId: newParentId },
          })
          exists = !!existing
          if (!exists) break
          counter++
        }

        return newParentId!
      }

      const newParentId = await generateParentId()

      parent = await prisma.parent.create({
        data: {
          userId: parentUser.id,
          parentId: newParentId,
          relationship: relationship || null,
        },
      })
    }

    // Check if relationship already exists
    const existingRelationship = await prisma.parentStudent.findUnique({
      where: {
        parentId_studentId: {
          parentId: parent.id,
          studentId: student.id,
        },
      },
    })

    if (existingRelationship) {
      return NextResponse.json(
        { error: 'Parent is already linked to this student' },
        { status: 400 }
      )
    }

    // If this is set as primary, unset other primary relationships
    if (isPrimary) {
      await prisma.parentStudent.updateMany({
        where: {
          studentId: student.id,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      })
    }

    // Create parent-student relationship
    const parentStudent = await prisma.parentStudent.create({
      data: {
        parentId: parent.id,
        studentId: student.id,
        relationship: relationship || null,
        isPrimary: isPrimary || false,
        canViewGrades: canViewGrades !== undefined ? canViewGrades : true,
        canViewAttendance: canViewAttendance !== undefined ? canViewAttendance : true,
        canViewDocuments: canViewDocuments !== undefined ? canViewDocuments : true,
      },
      include: {
        parent: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Parent added to student successfully',
      parentStudent: {
        id: parentStudent.id,
        parentId: parentStudent.parent.id,
        parentDisplayId: parentStudent.parent.parentId,
        parentUserId: parentStudent.parent.userId,
        firstName: parentStudent.parent.user.firstName,
        lastName: parentStudent.parent.user.lastName,
        email: parentStudent.parent.user.email,
        phone: parentStudent.parent.user.phone,
        relationship: parentStudent.relationship,
        isPrimary: parentStudent.isPrimary,
        canViewGrades: parentStudent.canViewGrades,
        canViewAttendance: parentStudent.canViewAttendance,
        canViewDocuments: parentStudent.canViewDocuments,
      },
    })
  } catch (error) {
    console.error('[API] Error adding parent to student:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

