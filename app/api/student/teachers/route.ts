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
            .map(user => {
                // Get the first active course for display
                const primaryCourse = user.teacher!.courses[0]
                const courseDisplay = primaryCourse 
                    ? `${primaryCourse.courseCode} - ${primaryCourse.name}`
                    : 'No active courses'
                
                // Generate office location based on department (or use a default)
                const department = user.teacher!.department || 'General'
                const officeMap: Record<string, string> = {
                    'Computer Science': 'Science Building 204',
                    'Mathematics': 'Math Building 105',
                    'English': 'Humanities Building 301',
                    'Physics': 'Science Building 301',
                    'Chemistry': 'Science Building 205',
                }
                const office = officeMap[department] || `${department} Building 100`
                
                // Generate office hours based on department (or use a default)
                const officeHoursMap: Record<string, string> = {
                    'Computer Science': 'Monday & Wednesday 2-4 PM',
                    'Mathematics': 'Tuesday & Thursday 1-3 PM',
                    'English': 'Monday, Wednesday & Friday 3-5 PM',
                    'Physics': 'Tuesday & Thursday 10-12 PM',
                    'Chemistry': 'Monday & Friday 1-3 PM',
                }
                const officeHours = officeHoursMap[department] || 'By appointment'
                
                // Generate bio based on department and rating
                const rating = user.teacher!.rating || 4.5
                const bioMap: Record<string, string> = {
                    'Computer Science': `Specializes in algorithms and data structures with ${Math.floor(rating * 3)} years of teaching experience.`,
                    'Mathematics': `Expert in advanced calculus and mathematical analysis with published research.`,
                    'English': `Award-winning educator focused on creative writing and literary analysis.`,
                    'Physics': `Research-focused instructor with expertise in theoretical and applied physics.`,
                    'Chemistry': `Experienced educator specializing in organic and inorganic chemistry.`,
                }
                const bio = user.bio || bioMap[department] || `Experienced educator in ${department} with a passion for teaching.`
                
                return {
                    id: user.teacher!.id,
                    teacherId: user.teacher!.teacherId,
                    userId: user.id,
                    name: `${user.firstName} ${user.lastName || ''}`.trim() || user.email,
                    email: user.email,
                    phone: user.phone || '(555) 000-0000',
                    firstName: user.firstName,
                    lastName: user.lastName,
                    department: user.teacher!.department || 'General',
                    course: courseDisplay,
                    office,
                    officeHours,
                    rating: user.teacher!.rating || 4.5,
                    bio,
                    courses: user.teacher!.courses.map(course => ({
                        id: course.id,
                        courseCode: course.courseCode,
                        name: course.name,
                        department: course.department,
                    })),
                }
            })

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
