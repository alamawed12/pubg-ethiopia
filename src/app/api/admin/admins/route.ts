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

// Known hardcoded accounts and their default passwords
const KNOWN_PASSWORDS: Record<string, string> = {
  'pmcaheadadmin@pubgmethiopia.et': 'pmcahead12',
  'pmcaeventscanner@pubgmethiopia.et': 'pmcascan12',
  'pubgmethiopia.et': 'pubget1213',
  'admin@pubgmethiopia.et': 'pubget1213',
  'admin@pubg-ethiopia.com': 'pubget1213',
};

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

// GET: List all registered administrators with their viewable credentials (Head Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isUserHeadAdmin(session)) {
      return NextResponse.json(
        {
          error: 'Forbidden: Only the Head Administrator has permission to view admin credentials.',
          isHeadAdmin: false,
        },
        { status: 403 }
      );
    }

    const [admins, passSettings] = await Promise.all([
      prisma.admin.findMany({
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
      }),
      prisma.systemSetting.findMany({
        where: {
          key: { startsWith: 'admin_pass_' },
        },
      }),
    ]);

    const passMap = new Map<string, string>();
    passSettings.forEach((s) => {
      const email = s.key.replace(/^admin_pass_/, '').toLowerCase();
      passMap.set(email, s.value);
    });

    const enrichedAdmins = admins.map((admin) => {
      const lowerEmail = admin.email.toLowerCase();
      const storedPass = passMap.get(lowerEmail) || KNOWN_PASSWORDS[lowerEmail] || null;
      return {
        ...admin,
        password: storedPass,
      };
    });

    return NextResponse.json({
      success: true,
      isHeadAdmin: true,
      admins: enrichedAdmins,
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

    // Hash the password for NextAuth authentication
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

    // Store assigned password so Head Admin can view/copy it anytime
    await prisma.systemSetting.upsert({
      where: { key: `admin_pass_${cleanEmail}` },
      update: { value: cleanPassword },
      create: { key: `admin_pass_${cleanEmail}`, value: cleanPassword },
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
      message: `Admin account for ${createdAdmin.name} (${createdAdmin.email}) registered successfully!`,
      admin: {
        ...createdAdmin,
        password: cleanPassword,
      },
    });
  } catch (error) {
    console.error('[ADMINS_POST_ERROR]', error);
    return NextResponse.json({ error: 'Failed to create administrator account' }, { status: 500 });
  }
}

// PATCH: Update admin details, role, or reset password (Head Admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isUserHeadAdmin(session)) {
      return NextResponse.json(
        { error: 'Forbidden: Only the Head Administrator can update admin credentials.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, name, role, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing admin ID parameter.' }, { status: 400 });
    }

    const targetAdmin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!targetAdmin) {
      return NextResponse.json({ error: 'Administrator account not found.' }, { status: 404 });
    }

    const updateData: { name?: string; role?: string; passwordHash?: string } = {};

    if (name && String(name).trim()) {
      updateData.name = String(name).trim();
    }

    if (role && ['admin', 'scanner', 'super_admin'].includes(role)) {
      updateData.role = role;
    }

    let updatedPlainPass: string | null = null;
    if (password && String(password).trim().length >= 6) {
      const cleanPass = String(password).trim();
      updateData.passwordHash = await bcrypt.hash(cleanPass, 10);
      updatedPlainPass = cleanPass;

      // Persist plaintext viewable copy for Head Admin
      await prisma.systemSetting.upsert({
        where: { key: `admin_pass_${targetAdmin.email.toLowerCase()}` },
        update: { value: cleanPass },
        create: { key: `admin_pass_${targetAdmin.email.toLowerCase()}`, value: cleanPass },
      });
    }

    const updated = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: session.user.email || 'head-admin',
        action: 'UPDATE_ADMIN_CREDENTIALS',
        targetId: id,
        details: JSON.stringify({
          email: targetAdmin.email,
          updatedFields: Object.keys(updateData),
          hasNewPassword: Boolean(updatedPlainPass),
          updatedBy: session.user.email,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Administrator ${updated.name} credentials updated successfully.`,
      admin: {
        ...updated,
        password: updatedPlainPass,
      },
    });
  } catch (error) {
    console.error('[ADMINS_PATCH_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update administrator credentials' }, { status: 500 });
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

    // Clean up stored password setting
    try {
      await prisma.systemSetting.delete({
        where: { key: `admin_pass_${adminToDelete.email.toLowerCase()}` },
      });
    } catch {}

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
