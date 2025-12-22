// Load environment variables from .env.local or .env
import { config } from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'
import { PrismaClient } from '../lib/generated/prisma/client'

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

const prisma = new PrismaClient()

// Default departments to migrate
const departments = [
  {
    name: 'Computer Science',
    description: 'Department of Computer Science and Information Technology',
  },

  {
    name: 'Business Adminsistration',
    description: 'Department of Business Adminsistration ',
  },
  {
    name: 'Accounts',
    description: 'Department of Accounts',
  },
  {
    name: 'Cyber Security',
    description: 'Department of Cyber Security',
  },
  {
    name: 'Engineering',
    description: 'Department of Engineering',
  },
]

async function migrateDepartments() {
  try {
    console.log('Starting department migration...')

    let created = 0
    let skipped = 0

    for (const dept of departments) {
      try {
        // Check if department already exists
        const existing = await prisma.department.findUnique({
          where: { name: dept.name },
        })

        if (existing) {
          console.log(`✓ Department "${dept.name}" already exists, skipping...`)
          skipped++
          continue
        }

        // Create department
        await prisma.department.create({
          data: {
            name: dept.name,
            description: dept.description,
          },
        })

        console.log(`✓ Created department: ${dept.name}`)
        created++
      } catch (error) {
        console.error(`✗ Error creating department "${dept.name}":`, error)
      }
    }

    console.log('\nMigration completed!')
    console.log(`Created: ${created} departments`)
    console.log(`Skipped: ${skipped} departments (already exist)`)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateDepartments()

