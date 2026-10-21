import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get('paymentStatus') || 'ALL';
    const paymentMethod = searchParams.get('paymentMethod') || 'ALL';
    const search = searchParams.get('search')?.trim() || '';

    // Calculate overall VIP metrics
    const [allVip, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.registration.findMany({
        where: { ticketTier: 'VIP' },
        select: { vipPrice: true, paymentStatus: true },
      }),
      prisma.registration.count({ where: { ticketTier: 'VIP', paymentStatus: 'PENDING_APPROVAL' } }),
      prisma.registration.count({ where: { ticketTier: 'VIP', paymentStatus: 'APPROVED' } }),
      prisma.registration.count({ where: { ticketTier: 'VIP', paymentStatus: 'REJECTED' } }),
    ]);

    const totalRevenueCollected = allVip
      .filter((r) => r.paymentStatus === 'APPROVED')
      .reduce((acc, curr) => acc + (curr.vipPrice || 500), 0);

    const pendingRevenue = allVip
      .filter((r) => r.paymentStatus === 'PENDING_APPROVAL')
      .reduce((acc, curr) => acc + (curr.vipPrice || 500), 0);

    const where: Prisma.RegistrationWhereInput = {
      ticketTier: 'VIP',
    };

    if (paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus;
    }

    if (paymentMethod !== 'ALL') {
      where.paymentMethod = paymentMethod;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { inGameName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { referenceId: { contains: search, mode: 'insensitive' } },
        { paymentTxnCode: { contains: search, mode: 'insensitive' } },
        { telegramUsername: { contains: search, mode: 'insensitive' } },
      ];
    }

    const payments = await prisma.registration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalVipCount: allVip.length,
        pendingApprovalCount: pendingCount,
        approvedCount,
        rejectedCount,
        totalRevenueCollected,
        pendingRevenue,
      },
      payments,
    });
  } catch (error) {
    console.error('[ADMIN_PAYMENTS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
