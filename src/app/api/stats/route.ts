import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [totalRegistrations, confirmed, pending, capacitySetting] = await Promise.all([
      prisma.registration.count(),
      prisma.registration.count({ where: { status: 'CONFIRMED' } }),
      prisma.registration.count({ where: { status: 'PENDING' } }),
      prisma.systemSetting.findUnique({ where: { key: 'max_capacity' } }),
    ]);

    const maxCapacity = capacitySetting ? parseInt(capacitySetting.value, 10) : 300;
    const capacity = isNaN(maxCapacity) ? 300 : maxCapacity;

    return NextResponse.json({
      totalRegistrations,
      confirmed,
      pending,
      capacity,
      isOpen: totalRegistrations < capacity,
    });
  } catch {
    return NextResponse.json({ totalRegistrations: 0, isOpen: true });
  }
}
