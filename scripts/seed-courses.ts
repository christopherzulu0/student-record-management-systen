// Load environment variables from .env.local or .env
import { config } from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'


// Try to load .env.local first (Next.js convention), then .env as fallback
const envLocalPath = resolve(process.cwd(), '.env.local')
const envPath = resolve(process.cwd(), '.env')

if (existsSync(envLocalPath)) {
  config({ path: envLocalPath })
  console.log('✓ Loaded environment variables from .env.local')
} else if (existsSync(envPath)) {
  config({ path: envPath })
  console.log('✓ Loaded environment variables from .env')
} else {
  console.warn('⚠ Warning: No .env.local or .env file found')
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('\n❌ Error: DATABASE_URL environment variable is not set!')
  console.error('Please make sure you have a .env.local or .env file with DATABASE_URL defined.')
  console.error('Current working directory:', process.cwd())
  process.exit(1)
}



// Course definitions by department
const coursesByDepartment: Record<string, Array<{
  courseCode: string
  name: string
  description: string
  credits: number
}>> = {
  'Engineering': [
    {
      courseCode: 'ENG101',
      name: 'Introduction to Engineering',
      description: 'Fundamental principles and practices of engineering, including problem-solving methodologies and engineering ethics.',
      credits: 3,
    },
    {
      courseCode: 'ENG102',
      name: 'Engineering Mathematics',
      description: 'Mathematical foundations for engineering including calculus, linear algebra, and differential equations.',
      credits: 4,
    },
    {
      courseCode: 'ENG201',
      name: 'Engineering Mechanics',
      description: 'Statics and dynamics principles applied to engineering systems and structures.',
      credits: 3,
    },
    {
      courseCode: 'ENG202',
      name: 'Materials Science',
      description: 'Properties and behavior of engineering materials including metals, polymers, and composites.',
      credits: 3,
    },
    {
      courseCode: 'ENG301',
      name: 'Thermodynamics',
      description: 'Energy transfer, heat engines, and thermodynamic systems in engineering applications.',
      credits: 3,
    },
    {
      courseCode: 'ENG302',
      name: 'Fluid Mechanics',
      description: 'Principles of fluid flow, pressure, and fluid dynamics in engineering systems.',
      credits: 3,
    },
    {
      courseCode: 'ENG401',
      name: 'Engineering Design Project',
      description: 'Capstone project applying engineering principles to real-world design challenges.',
      credits: 4,
    },
  ],
  'Cyber Security': [
    {
      courseCode: 'CSEC101',
      name: 'Introduction to Cyber Security',
      description: 'Fundamentals of information security, threats, vulnerabilities, and basic security principles.',
      credits: 3,
    },
    {
      courseCode: 'CSEC102',
      name: 'Network Security',
      description: 'Securing network infrastructure, firewalls, intrusion detection systems, and VPN technologies.',
      credits: 3,
    },
    {
      courseCode: 'CSEC201',
      name: 'Ethical Hacking',
      description: 'Penetration testing methodologies, vulnerability assessment, and security auditing techniques.',
      credits: 3,
    },
    {
      courseCode: 'CSEC202',
      name: 'Cryptography',
      description: 'Encryption algorithms, digital signatures, key management, and cryptographic protocols.',
      credits: 3,
    },
    {
      courseCode: 'CSEC301',
      name: 'Digital Forensics',
      description: 'Investigation techniques for cybercrimes, evidence collection, and forensic analysis.',
      credits: 3,
    },
    {
      courseCode: 'CSEC302',
      name: 'Security Risk Management',
      description: 'Risk assessment, threat modeling, security policies, and compliance frameworks.',
      credits: 3,
    },
    {
      courseCode: 'CSEC401',
      name: 'Advanced Security Operations',
      description: 'Security operations center (SOC) management, incident response, and security monitoring.',
      credits: 4,
    },
  ],
  'Accounts': [
    {
      courseCode: 'ACC101',
      name: 'Principles of Accounting',
      description: 'Fundamental accounting concepts, double-entry bookkeeping, and financial statement preparation.',
      credits: 3,
    },
    {
      courseCode: 'ACC102',
      name: 'Financial Accounting',
      description: 'Preparation and analysis of financial statements, GAAP principles, and reporting standards.',
      credits: 3,
    },
    {
      courseCode: 'ACC201',
      name: 'Managerial Accounting',
      description: 'Cost accounting, budgeting, variance analysis, and decision-making for management.',
      credits: 3,
    },
    {
      courseCode: 'ACC202',
      name: 'Intermediate Accounting',
      description: 'Advanced topics in financial accounting including revenue recognition and asset valuation.',
      credits: 3,
    },
    {
      courseCode: 'ACC301',
      name: 'Auditing',
      description: 'Audit procedures, internal controls, risk assessment, and professional auditing standards.',
      credits: 3,
    },
    {
      courseCode: 'ACC302',
      name: 'Taxation',
      description: 'Tax law, tax planning strategies, and preparation of individual and corporate tax returns.',
      credits: 3,
    },
    {
      courseCode: 'ACC401',
      name: 'Advanced Financial Reporting',
      description: 'Complex financial reporting issues, consolidations, and international accounting standards.',
      credits: 4,
    },
  ],
  'Business Adminsistration': [
    {
      courseCode: 'BA101',
      name: 'Introduction to Business',
      description: 'Overview of business functions, organizational structures, and business environment.',
      credits: 3,
    },
    {
      courseCode: 'BA102',
      name: 'Business Communication',
      description: 'Effective written and oral communication skills for professional business environments.',
      credits: 3,
    },
    {
      courseCode: 'BA201',
      name: 'Principles of Management',
      description: 'Management theories, leadership styles, organizational behavior, and team dynamics.',
      credits: 3,
    },
    {
      courseCode: 'BA202',
      name: 'Marketing Fundamentals',
      description: 'Marketing principles, consumer behavior, market research, and marketing strategies.',
      credits: 3,
    },
    {
      courseCode: 'BA301',
      name: 'Financial Management',
      description: 'Corporate finance, capital budgeting, financial analysis, and investment decisions.',
      credits: 3,
    },
    {
      courseCode: 'BA302',
      name: 'Operations Management',
      description: 'Production systems, supply chain management, quality control, and process optimization.',
      credits: 3,
    },
    {
      courseCode: 'BA401',
      name: 'Strategic Management',
      description: 'Strategic planning, competitive analysis, business strategy formulation and implementation.',
      credits: 4,
    },
    {
      courseCode: 'BA402',
      name: 'Business Ethics and Corporate Social Responsibility',
      description: 'Ethical decision-making in business, corporate governance, and social responsibility.',
      credits: 3,
    },
  ],
  'Computer Science': [
    {
      courseCode: 'CS101',
      name: 'Introduction to Computer Science',
      description: 'Fundamental concepts of computer science, algorithms, and problem-solving techniques.',
      credits: 3,
    },
    {
      courseCode: 'CS102',
      name: 'Programming Fundamentals',
      description: 'Basic programming concepts, data structures, and control structures using a modern programming language.',
      credits: 4,
    },
    {
      courseCode: 'CS201',
      name: 'Data Structures and Algorithms',
      description: 'Advanced data structures, algorithm analysis, and efficient algorithm design.',
      credits: 4,
    },
    {
      courseCode: 'CS202',
      name: 'Object-Oriented Programming',
      description: 'OOP principles, design patterns, inheritance, polymorphism, and software design.',
      credits: 3,
    },
    {
      courseCode: 'CS301',
      name: 'Database Systems',
      description: 'Database design, SQL, normalization, transaction management, and database administration.',
      credits: 3,
    },
    {
      courseCode: 'CS302',
      name: 'Software Engineering',
      description: 'Software development lifecycle, requirements analysis, design methodologies, and testing.',
      credits: 3,
    },
    {
      courseCode: 'CS401',
      name: 'Operating Systems',
      description: 'OS concepts, process management, memory management, file systems, and concurrency.',
      credits: 3,
    },
    {
      courseCode: 'CS402',
      name: 'Computer Networks',
      description: 'Network protocols, TCP/IP, network architecture, and network security fundamentals.',
      credits: 3,
    },
    {
      courseCode: 'CS403',
      name: 'Capstone Project',
      description: 'Comprehensive software development project integrating multiple computer science concepts.',
      credits: 4,
    },
  ],
}

async function seedCourses() {
  try {
    console.log('Starting course seeding...\n')

    let totalCreated = 0
    let totalSkipped = 0
    let departmentsCreated = 0

    // Process each department
    for (const [departmentName, courses] of Object.entries(coursesByDepartment)) {
      console.log(`\n📚 Processing department: ${departmentName}`)
      console.log(`   Courses to seed: ${courses.length}`)

      // Ensure department exists
      let department = await prisma.department.findUnique({
        where: { name: departmentName },
      })

      if (!department) {
        console.log(`   ⚠ Department "${departmentName}" not found. Creating...`)
        department = await prisma.department.create({
          data: {
            name: departmentName,
            description: `Department of ${departmentName}`,
          },
        })
        departmentsCreated++
        console.log(`   ✓ Created department: ${departmentName}`)
      } else {
        console.log(`   ✓ Department "${departmentName}" exists`)
      }

      // Seed courses for this department
      let deptCreated = 0
      let deptSkipped = 0

      for (const course of courses) {
        try {
          // Check if course already exists
          const existing = await prisma.course.findUnique({
            where: { courseCode: course.courseCode },
          })

          if (existing) {
            console.log(`   ⏭ Course "${course.courseCode}" already exists, skipping...`)
            deptSkipped++
            continue
          }

          // Create course
          await prisma.course.create({
            data: {
              courseCode: course.courseCode,
              name: course.name,
              description: course.description,
              credits: course.credits,
              department: departmentName,
              departmentId: department.id,
              status: 'active',
            },
          })

          console.log(`   ✓ Created: ${course.courseCode} - ${course.name}`)
          deptCreated++
        } catch (error) {
          console.error(`   ✗ Error creating course "${course.courseCode}":`, error)
        }
      }

      console.log(`   Summary: ${deptCreated} created, ${deptSkipped} skipped`)
      totalCreated += deptCreated
      totalSkipped += deptSkipped
    }

    console.log('\n' + '='.repeat(60))
    console.log('Seeding completed!')
    console.log('='.repeat(60))
    console.log(`Departments created: ${departmentsCreated}`)
    console.log(`Courses created: ${totalCreated}`)
    console.log(`Courses skipped: ${totalSkipped} (already exist)`)
    console.log(`Total courses processed: ${totalCreated + totalSkipped}`)
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run seeding
seedCourses()

