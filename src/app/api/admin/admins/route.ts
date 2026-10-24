import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface AdminSession {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

// Helper to determine if the session user is Head Administrator
function isUserHeadAdmin(session: AdminSession | null | undefined): boolean {
  if (!session?.user) return false;
  const role = session.user.role;
  const email = (session.user.email || '').toLowerCase().trim();
  return (
    role === 'super_admin' ||
    email === 'pmcaheadadmin@pubgmethiopia.et' ||
    email === 'admin@pubgmethiopia.et' ||
    email === 'pubgmethiopia.et'
  );
}

// GET: List all registered administrators (Head Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isUserHeadAdmin(session)) {
      return NextResponse.json(
        {
          error: 'Forbidden: Only the Head Administrator has permission to view admin accounts.',
          isHeadAdmin: false,
        },
        { status: 403 }
      );
    }

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      isHeadAdmin: true,
      admins,
    });
  } catch (error) {
    console.error('[ADMINS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to retrieve administrator accounts' }, { status: 500 });
  }
}

// POST: Register a new admin account (Head Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isUserHeadAdmin(session)) {
      return NextResponse.json(
        { error: 'Forbidden: Only the Head Administrator can register new admin accounts. Sub-admins do not have this privilege.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, password, name, role } = body;

    const cleanEmail = String(email || '').toLowerCase().trim();
    const cleanPassword = String(password || '').trim();
    const cleanName = String(name || '').trim();
    const cleanRole = ['admin', 'scanner', 'super_admin'].includes(role) ? role : 'admin';

    // Validation
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    if (!cleanName) {
      return NextResponse.json({ error: 'Please provide an administrator name or title.' }, { status: 400 });
    }

    // Check if an admin with this email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: cleanEmail },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: `An admin account with email "${cleanEmail}" is already registered.` },
        { status: 400 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(cleanPassword, 10);

    // Create the admin record in the database
    const createdAdmin = await prisma.admin.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name: cleanName,
        role: cleanRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        adminEmail: session.user.email || 'head-admin',
        action: 'REGISTER_NEW_ADMIN',
        targetId: createdAdmin.id,
        details: JSON.stringify({
          createdEmail: createdAdmin.email,
          createdName: createdAdmin.name,
          role: createdAdmin.role,
          registeredBy: session.user.email,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Admin account for ${createdAdmin.name} (${createdAdmin.email}) registered successfully! They can now log in at /admin/login.`,
      admin: createdAdmin,
    });
  } catch (error) {
    console.error('[ADMINS_POST_ERROR]', error);
    return NextResponse.json({ error: 'Failed to create administrator account' }, { status: 500 });
  }
}

// DELETE: Delete / Revoke an admin account (Head Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isUserHeadAdmin(session)) {
      return NextResponse.json(
        { error: 'Forbidden: Only the Head Administrator can remove admin accounts.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get('id');

    if (!adminId) {
      return NextResponse.json({ error: 'Missing admin ID parameter.' }, { status: 400 });
    }

    const adminToDelete = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!adminToDelete) {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 });
    }

    // Protect primary Head Admin account
    if (
      adminToDelete.email.toLowerCase() === 'pmcaheadadmin@pubgmethiopia.et' ||
      adminToDelete.email.toLowerCase() === 'pubgmethiopia.et'
    ) {
      return NextResponse.json(
        { error: 'Safety protection: The primary HQ Head Administrator account cannot be deleted.' },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (adminToDelete.email.toLowerCase() === (session.user.email || '').toLowerCase()) {
      return NextResponse.json(
        { error: 'You cannot delete your own active administrator account while logged in.' },
        { status: 400 }
      );
    }

    await prisma.admin.delete({
      where: { id: adminId },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: session.user.email || 'head-admin',
        action: 'DELETE_ADMIN',
        targetId: adminId,
        details: JSON.stringify({
          deletedEmail: adminToDelete.email,
          deletedName: adminToDelete.name,
          deletedBy: session.user.email,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Administrator ${adminToDelete.name} (${adminToDelete.email}) was removed successfully.`,
    });
  } catch (error) {
    console.error('[ADMINS_DELETE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete administrator account' }, { status: 500 });
  }
}
