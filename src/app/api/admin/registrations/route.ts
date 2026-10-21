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
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status')?.trim();
    const category = searchParams.get('category')?.trim();
    const ticketTier = searchParams.get('ticketTier')?.trim();
    const paymentStatus = searchParams.get('paymentStatus')?.trim();

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.RegistrationWhereInput = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (ticketTier && ticketTier !== 'ALL') {
      where.ticketTier = ticketTier;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { inGameName: { contains: search, mode: 'insensitive' } },
        { pubgUid: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { referenceId: { contains: search, mode: 'insensitive' } },
        { teamName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, registrations] = await Promise.all([
      prisma.registration.count({ where }),
      prisma.registration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      registrations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('[ADMIN_REGISTRATIONS_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to retrieve registrations' },
      { status: 500 }
    );
  }
}

// BATCH ACCEPT / DECLINE
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'scanner') {
      return NextResponse.json({ error: 'Scanner accounts cannot modify registration status' }, { status: 403 });
    }

    const body = await request.json();
    const { action, ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No registrations selected' }, { status: 400 });
    }

    if (action === 'ACCEPT') {
      // Set to CONFIRMED and approve VIP payments
      const result = await prisma.registration.updateMany({
        where: { id: { in: ids } },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'APPROVED',
          paymentApprovedAt: new Date(),
          paymentApprovedBy: session.user.email || 'Head Admin',
        },
      });

      await prisma.auditLog.create({
        data: {
          adminEmail: session.user.email || 'system',
          action: 'BATCH_REGISTRATIONS_ACCEPTED',
          details: JSON.stringify({ count: result.count, ids }),
        },
      });

      return NextResponse.json({ success: true, count: result.count, action: 'ACCEPT' });
    }

    if (action === 'DECLINE') {
      // Set to REJECTED and reject VIP payments
      const result = await prisma.registration.updateMany({
        where: { id: { in: ids } },
        data: {
          status: 'REJECTED',
          paymentStatus: 'REJECTED',
        },
      });

      await prisma.auditLog.create({
        data: {
          adminEmail: session.user.email || 'system',
          action: 'BATCH_REGISTRATIONS_DECLINED',
          details: JSON.stringify({ count: result.count, ids }),
        },
      });

      return NextResponse.json({ success: true, count: result.count, action: 'DECLINE' });
    }

    return NextResponse.json({ error: 'Invalid action provided' }, { status: 400 });
  } catch (error) {
    console.error('[ADMIN_REGISTRATIONS_BATCH_PATCH_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update registrations' }, { status: 500 });
  }
}

// CLEAR ALL REGISTRATIONS OR DELETE SELECTED
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'scanner') {
      return NextResponse.json({ error: 'Scanner accounts cannot delete registrations' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { all, ids } = body;

    if (all === true) {
      // Purge all registrations and reset verified payments
      const [deletedRegs, deletedPayments] = await Promise.all([
        prisma.registration.deleteMany({}),
        prisma.verifiedPayment.deleteMany({}),
      ]);

      await prisma.auditLog.create({
        data: {
          adminEmail: session.user.email || 'system',
          action: 'PURGE_ALL_REGISTRATIONS',
          details: JSON.stringify({
            deletedRegistrations: deletedRegs.count,
            deletedPayments: deletedPayments.count,
            performedBy: session.user.email,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'All registrations and payment records successfully cleared.',
        count: deletedRegs.count,
      });
    }

    if (Array.isArray(ids) && ids.length > 0) {
      const result = await prisma.registration.deleteMany({
        where: { id: { in: ids } },
      });

      await prisma.auditLog.create({
        data: {
          adminEmail: session.user.email || 'system',
          action: 'DELETE_SELECTED_REGISTRATIONS',
          details: JSON.stringify({ count: result.count, ids }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Deleted ${result.count} registration(s).`,
        count: result.count,
      });
    }

    return NextResponse.json({ error: 'Specify either all: true or an array of ids' }, { status: 400 });
  } catch (error) {
    console.error('[ADMIN_REGISTRATIONS_DELETE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete registrations' }, { status: 500 });
  }
}
