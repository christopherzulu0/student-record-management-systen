// Mock database with in-memory storage
export interface User {
  id: string
  email: string
  name: string
  role: "student" | "teacher" | "admin"
  createdAt: Date
}

export interface Student {
  id: string
  userId: string
  studentId: string
  enrollmentDate: Date
  gpa: number
}

export interface Grade {
  id: string
  studentId: string
  courseId: string
  grade: string
  score: number
  semester: string
  year: number
}

export interface Course {
  id: string
  code: string
  name: string
  credits: number
  instructor: string
}

export interface Transcript {
  studentId: string
  grades: Grade[]
  cumulativeGPA: number
  totalCredits: number
}

export interface RecommendationLetter {
  id: string
  studentId: string
  instructorId: string
  letterText: string
  createdAt: Date
  signedBy: string
}

export interface CourseAssignment {
  id: string
  courseId: string
  teacherId: string
  semester: string
  year: number
  enrollmentCap: number
  currentEnrollment: number
}

// Added Semester interface
export interface Semester {
  id: string
  name: string
  year: number
  startDate: Date
  endDate: Date
  status: "draft" | "active" | "archived"
  registrationDeadline: Date
}

// In-memory database
const users: User[] = [
  {
    id: "1",
    email: "admin@university.edu",
    name: "Admin User",
    role: "admin",
    createdAt: new Date(),
  },
  {
    id: "2",
    email: "teacher@university.edu",
    name: "Dr. Jane Smith",
    role: "teacher",
    createdAt: new Date(),
  },
  {
    id: "3",
    email: "student@university.edu",
    name: "John Doe",
    role: "student",
    createdAt: new Date(),
  },
]

const students: Student[] = [
  {
    id: "1",
    userId: "3",
    studentId: "STU001",
    enrollmentDate: new Date("2022-09-01"),
    gpa: 3.75,
  },
]

const courses: Course[] = [
  { id: "1", code: "CS101", name: "Introduction to Computer Science", credits: 3, instructor: "Dr. Jane Smith" },
  { id: "2", code: "MATH201", name: "Calculus II", credits: 4, instructor: "Dr. John Wilson" },
  { id: "3", code: "ENG102", name: "English Composition", credits: 3, instructor: "Prof. Emily Brown" },
]

const grades: Grade[] = [
  { id: "1", studentId: "1", courseId: "1", grade: "A", score: 92, semester: "Fall", year: 2023 },
  { id: "2", studentId: "1", courseId: "2", grade: "A-", score: 89, semester: "Fall", year: 2023 },
  { id: "3", studentId: "1", courseId: "3", grade: "B+", score: 87, semester: "Spring", year: 2024 },
]

const recommendations: RecommendationLetter[] = []

const courseAssignments: CourseAssignment[] = [
  {
    id: "1",
    courseId: "1",
    teacherId: "1",
    semester: "Fall",
    year: 2024,
    enrollmentCap: 30,
    currentEnrollment: 28,
  },
  {
    id: "2",
    courseId: "2",
    teacherId: "2",
    semester: "Fall",
    year: 2024,
    enrollmentCap: 25,
    currentEnrollment: 24,
  },
  {
    id: "3",
    courseId: "3",
    teacherId: "3",
    semester: "Fall",
    year: 2024,
    enrollmentCap: 35,
    currentEnrollment: 32,
  },
]

// Added semesters array
const semesters: Semester[] = [
  {
    id: "1",
    name: "Fall",
    year: 2024,
    startDate: new Date("2024-09-01"),
    endDate: new Date("2024-12-15"),
    status: "active",
    registrationDeadline: new Date("2024-08-15"),
  },
  {
    id: "2",
    name: "Spring",
    year: 2025,
    startDate: new Date("2025-01-15"),
    endDate: new Date("2025-05-10"),
    status: "draft",
    registrationDeadline: new Date("2024-12-20"),
  },
]

// Teachers data
const teachers: Array<{
  id: string
  userId: string
  name: string
  email: string
  department: string
  courses: string[]
}> = [
  {
    id: "1",
    userId: "2",
    name: "Dr. Jane Smith",
    email: "teacher@university.edu",
    department: "Computer Science",
    courses: ["CS101"],
  },
  {
    id: "2",
    userId: "2",
    name: "Dr. John Wilson",
    email: "john.wilson@university.edu",
    department: "Mathematics",
    courses: ["MATH201"],
  },
  {
    id: "3",
    userId: "2",
    name: "Prof. Emily Brown",
    email: "emily.brown@university.edu",
    department: "English",
    courses: ["ENG102"],
  },
]

// User operations
export const db = {
  users: {
    findByEmail: (email: string) => users.find((u) => u.email === email),
    findById: (id: string) => users.find((u) => u.id === id),
    create: (user: Omit<User, "id" | "createdAt">) => {
      const newUser = { ...user, id: String(users.length + 1), createdAt: new Date() }
      users.push(newUser)
      return newUser
    },
  },
  students: {
    findByUserId: (userId: string) => students.find((s) => s.userId === userId),
    getAll: () => students,
    getGPA: (studentId: string) => {
      const studentGrades = grades.filter((g) => g.studentId === studentId)
      if (studentGrades.length === 0) return 0
      const totalPoints = studentGrades.reduce((sum, g) => sum + g.score, 0)
      return Number((totalPoints / studentGrades.length).toFixed(2))
    },
  },
  grades: {
    getByStudent: (studentId: string) => grades.filter((g) => g.studentId === studentId),
    add: (grade: Omit<Grade, "id">) => {
      const newGrade = { ...grade, id: String(grades.length + 1) }
      grades.push(newGrade)
      return newGrade
    },
  },
  courses: {
    getAll: () => courses,
    getById: (id: string) => courses.find((c) => c.id === id),
    create: (course: Omit<Course, "id">) => {
      const newCourse = { ...course, id: String(courses.length + 1) }
      courses.push(newCourse)
      return newCourse
    },
  },
  courseAssignments: {
    getAll: () => courseAssignments,
    create: (assignment: Omit<CourseAssignment, "id">) => {
      const newAssignment = { ...assignment, id: String(courseAssignments.length + 1) }
      courseAssignments.push(newAssignment)
      return newAssignment
    },
    getByTeacher: (teacherId: string) => courseAssignments.filter((ca) => ca.teacherId === teacherId),
  },
  recommendations: {
    create: (rec: Omit<RecommendationLetter, "id">) => {
      const newRec = { ...rec, id: String(recommendations.length + 1) }
      recommendations.push(newRec)
      return newRec
    },
    getByStudent: (studentId: string) => recommendations.filter((r) => r.studentId === studentId),
  },
  teachers: {
    getAll: () => teachers,
    getById: (id: string) => teachers.find((t) => t.id === id),
  },
  semesters: {
    getAll: () => semesters,
    getById: (id: string) => semesters.find((s) => s.id === id),
    create: (semester: Omit<Semester, "id">) => {
      const newSemester = { ...semester, id: String(semesters.length + 1) }
      semesters.push(newSemester)
      return newSemester
    },
    update: (id: string, updates: Partial<Semester>) => {
      const index = semesters.findIndex((s) => s.id === id)
      if (index !== -1) {
        semesters[index] = { ...semesters[index], ...updates }
        return semesters[index]
      }
      return null
    },
    delete: (id: string) => {
      const index = semesters.findIndex((s) => s.id === id)
      if (index !== -1) {
        semesters.splice(index, 1)
        return true
      }
      return false
    },
  },
}
