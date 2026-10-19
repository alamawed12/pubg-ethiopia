import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

/**
 * NextAuth configuration for PUBG Mobile Community Assembly Ethiopia.
 * Authenticates admin users against the Admin table using bcryptjs password hashing.
 * Adds admin `id` and `role` to both the JWT token and the active session.
 */
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
        const masterEmail = (process.env.ADMIN_EMAIL || 'admin@pubg-ethiopia.com').toLowerCase().trim();
        const masterPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // 1. Check against master credentials (guaranteed to work on fresh cloud deployments)
        if (normalizedEmail === masterEmail && credentials.password === masterPassword) {
          try {
            const passwordHash = await bcrypt.hash(masterPassword, 10);
            await prisma.admin.upsert({
              where: { email: masterEmail },
              update: { passwordHash },
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
