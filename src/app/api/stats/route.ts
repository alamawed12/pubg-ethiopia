import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const totalRegistrations = await prisma.registration.count();
    const confirmed = await prisma.registration.count({ where: { status: 'CONFIRMED' } });
    const pending = await prisma.registration.count({ where: { status: 'PENDING' } });

    return NextResponse.json({
      totalRegistrations,
      confirmed,
      pending,
      isOpen: totalRegistrations < 300,
    });
  } catch {
    return NextResponse.json({ totalRegistrations: 0, isOpen: true });
  }
}
