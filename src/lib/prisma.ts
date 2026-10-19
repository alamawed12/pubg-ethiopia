import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

/**
 * Handle Vercel / AWS Lambda serverless environment for SQLite.
 * On Vercel, the application directory (/var/task) is strictly read-only.
 * SQLite requires directory write access for locking and journals.
 * The only writable directory in serverless environments is /tmp.
 */
function prepareDatabaseForServerless() {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./dev.db';
  }
  const currentDbUrl = process.env.DATABASE_URL;

  // Only apply when using local SQLite file: on Vercel or AWS Lambda
  if (currentDbUrl.startsWith('file:') && (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)) {
    const tmpDbPath = '/tmp/dev.db';

    // If /tmp/dev.db doesn't exist yet in this container, copy our template db
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
      ];

      let copied = false;
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            copied = true;
            break;
          } catch (e) {
            console.error('[PRISMA_COPY_TO_TMP_ERROR]', e);
          }
        }
      }

      if (!copied) {
        try {
          fs.writeFileSync(tmpDbPath, '');
        } catch (e) {
          console.error('[PRISMA_CREATE_TMP_ERROR]', e);
        }
      }
    }

    process.env.DATABASE_URL = `file:${tmpDbPath}`;
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
