import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('[ADMIN_ANNOUNCEMENTS_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, type = 'info', isActive = true } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const adminEmail = session.user.email || session.user.name || 'admin';

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        type,
        isActive: Boolean(isActive),
        createdBy: adminEmail,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        adminEmail,
        action: 'ANNOUNCEMENT_CREATED',
        targetId: announcement.id,
        details: JSON.stringify({ title, type, isActive }),
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('[ADMIN_ANNOUNCEMENTS_POST_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
