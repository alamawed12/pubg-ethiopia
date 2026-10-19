import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: announcements });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
