import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client singleton pattern for Next.js.
 * In development, Next.js clears Node.js cache on hot-reload,
 * which would instantiate a new PrismaClient on each reload.
 * Attaching it to `globalThis` prevents multiple active connections.
 */

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
