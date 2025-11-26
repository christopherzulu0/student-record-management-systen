import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch all teachers (for students to select when requesting recommendations)
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

        // Verify user exists and is a student
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
            select: { role: true },
        })

        if (!user || user.role !== 'student') {
            return NextResponse.json(
                { error: 'Forbidden - Student access required' },
                { status: 403 }
            )
        }

        // Fetch all users with role "teacher" and their Teacher records
        const usersWithTeacherRole = await prisma.user.findMany({
            where: {
                role: 'teacher',
                status: 'active',
            },
            include: {
                teacher: {
                    include: {
                        courses: {
                            where: {
                                status: 'active',
                            },
                            select: {
                                id: true,
                                courseCode: true,
                                name: true,
                                department: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                lastName: 'asc',
            },
        })

        // Format teachers for student selection
        const formattedTeachers = usersWithTeacherRole
            .filter(user => user.teacher) // Only include users with Teacher records
            .map(user => ({
                id: user.teacher!.id,
                teacherId: user.teacher!.teacherId,
                userId: user.id,
                name: `${user.firstName} ${user.lastName || ''}`.trim() || user.email,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                department: user.teacher!.department,
                rating: user.teacher!.rating,
                courses: user.teacher!.courses.map(course => ({
                    id: course.id,
                    courseCode: course.courseCode,
                    name: course.name,
                    department: course.department,
                })),
            }))

        return NextResponse.json(formattedTeachers)
    } catch (error) {
        console.error('[API] Error fetching teachers for students:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
