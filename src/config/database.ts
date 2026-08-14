import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:admin@localhost:5432/video_repo'

// Prisma 7 requires a driver adapter to connect to the database
const adapter = new PrismaPg(connectionString)

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ adapter })
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ adapter })
  }
  prisma = globalForPrisma.prisma
}

export default prisma