import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// Automatically configure NextAuth URL in serverless Vercel environments if user imported localhost .env
if (process.env.VERCEL_URL && (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes('localhost'))) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Admin Credentials',
      credentials: {
        email: {
          label: 'Admin Email',
          type: 'email',
          placeholder: 'admin@pubg-ethiopia.et',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();

        // 1. HQ Head Admin Account (Full access to everything)
        if (
          normalizedEmail === 'pmcaheadadmin@pubgmethiopia.et' &&
          credentials.password === 'pmcahead12'
        ) {
          try {
            const passwordHash = await bcrypt.hash('pmcahead12', 10);
            await prisma.admin.upsert({
              where: { email: 'pmcaheadadmin@pubgmethiopia.et' },
              update: { passwordHash, role: 'super_admin' },
              create: {
                email: 'pmcaheadadmin@pubgmethiopia.et',
                passwordHash,
                name: 'HQ Head Administrator',
                role: 'super_admin',
              },
            });
          } catch {
            // DB upsert non-fatal
          }

          return {
            id: 'admin-hq-head',
            email: 'pmcaheadadmin@pubgmethiopia.et',
            name: 'HQ Head Administrator',
            role: 'super_admin',
          };
        }

        // 2. Event Scanner Admin Account (Scan and check-in ONLY)
        if (
          normalizedEmail === 'pmcaeventscanner@pubgmethiopia.et' &&
          credentials.password === 'pmcascan12'
        ) {
          try {
            const passwordHash = await bcrypt.hash('pmcascan12', 10);
            await prisma.admin.upsert({
              where: { email: 'pmcaeventscanner@pubgmethiopia.et' },
              update: { passwordHash, role: 'scanner' },
              create: {
                email: 'pmcaeventscanner@pubgmethiopia.et',
                passwordHash,
                name: 'Event Scanner Staff',
                role: 'scanner',
              },
            });
          } catch {
            // DB upsert non-fatal
          }

          return {
            id: 'admin-event-scanner',
            email: 'pmcaeventscanner@pubgmethiopia.et',
            name: 'Event Scanner Staff',
            role: 'scanner',
          };
        }

        // 3. Backup Master Administrator Account
        const masterEmail = (process.env.ADMIN_EMAIL || 'pubgmethiopia.et').toLowerCase().trim();
        const masterPassword = process.env.ADMIN_PASSWORD || 'pubget1213';
        const isMasterMatch =
          (normalizedEmail === masterEmail ||
           normalizedEmail === 'pubgmethiopia.et' ||
           normalizedEmail === 'admin@pubgmethiopia.et' ||
           normalizedEmail === 'admin@pubg-ethiopia.com') &&
          (credentials.password === masterPassword || credentials.password === 'pubget1213');

        if (isMasterMatch) {
          try {
            const passwordHash = await bcrypt.hash(masterPassword, 10);
            await prisma.admin.upsert({
              where: { email: masterEmail },
              update: { passwordHash, role: 'super_admin' },
              create: {
                email: masterEmail,
                passwordHash,
                name: 'Assembly Administrator',
                role: 'super_admin',
              },
            });
          } catch {
            // DB upsert is non-fatal if database is read-only
          }

          return {
            id: 'admin-master',
            email: masterEmail,
            name: 'Assembly Administrator',
            role: 'super_admin',
          };
        }

        // 2. Check against database admin records
        try {
          const admin = await prisma.admin.findUnique({
            where: {
              email: normalizedEmail,
            },
          });

          if (!admin || !admin.passwordHash) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            admin.passwordHash
          );

          if (!isValidPassword) {
            return null;
          }

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          };
        } catch (error) {
          console.error('[AUTH_AUTHORIZE_ERROR]', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        if (token.email) session.user.email = token.email;
        if (token.name) session.user.name = token.name;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'pubg-ethiopia-assembly-fallback-secret-2026',
  debug: process.env.NODE_ENV === 'development',
};

export default authOptions;
