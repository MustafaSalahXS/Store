export * from '@prisma/client'

// Use runtime require and `any` typing to avoid TypeScript export mismatches across Prisma versions
const PrismaPkg: any = require('@prisma/client')
const PrismaClientCtor: any = PrismaPkg.PrismaClient || PrismaPkg.default?.PrismaClient || PrismaPkg.default

const globalForPrisma: any = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClientCtor()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
