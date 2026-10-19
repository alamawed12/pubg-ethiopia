const { execSync } = require('child_process');

// Auto-detect PostgreSQL database URL from Neon / Vercel Storage
const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

if (dbUrl) {
  console.log('[BUILD_STEP] Cloud database URL detected. Syncing schema to PostgreSQL...');
  try {
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl },
    });
    console.log('[BUILD_STEP] Cloud database schema synchronized successfully.');
  } catch (err) {
    console.warn('[BUILD_STEP_WARNING] Prisma db push warning (non-fatal):', err.message);
  }
} else {
  console.log('[BUILD_STEP] No cloud DATABASE_URL found during build step. Proceeding with application build...');
}

// Execute Next.js production compilation
console.log('[BUILD_STEP] Starting Next.js production build...');
execSync('next build', {
  stdio: 'inherit',
  env: { ...process.env, ...(dbUrl ? { DATABASE_URL: dbUrl } : {}) },
});
