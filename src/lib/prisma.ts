import { PrismaClient } from '@prisma/client';

/**
 * Handle Vercel / AWS Lambda serverless environment for SQLite.
 * On Vercel, the application directory (/var/task) is strictly read-only.
 * SQLite requires directory write access for locking and journals.
 * The only writable directory in serverless environments is /tmp.
 */
function prepareDatabaseForServerless() {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL =
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL ||
      '';
  }
}

prepareDatabaseForServerless();

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
