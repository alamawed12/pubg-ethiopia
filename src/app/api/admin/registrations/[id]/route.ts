import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Look up by id or referenceId
    const registration = await prisma.registration.findFirst({
      where: {
        OR: [{ id }, { referenceId: id }],
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Retrieve corresponding audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        targetId: registration.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      registration,
      auditLogs,
    });
  } catch (error) {
    console.error('[ADMIN_REGISTRATION_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch registration details' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status, teamName, category } = body;

    const existing = await prisma.registration.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Registration record not found' },
        { status: 404 }
      );
    }

    const updateData: {
      status?: string;
      teamName?: string;
      category?: string;
    } = {};

    if (status) updateData.status = status;
    if (teamName !== undefined) updateData.teamName = teamName;
    if (category) updateData.category = category;

    const updated = await prisma.registration.update({
      where: { id },
      data: updateData,
    });

    // Write audit log entry
    await prisma.auditLog.create({
      data: {
        adminEmail: session.user.email || 'system',
        action: status ? `REGISTRATION_${status}` : 'REGISTRATION_UPDATED',
        targetId: id,
        details: JSON.stringify({
          previousStatus: existing.status,
          newStatus: status || existing.status,
          changes: updateData,
        }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[ADMIN_REGISTRATION_PATCH_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    );
  }
}
