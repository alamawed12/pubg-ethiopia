import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateQRDataURL } from '@/lib/qr';

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

    // Generate security QR Data URL for admin ticket viewing & Telegram dispatch
    let qrDataUrl = '';
    try {
      const qrPayload = JSON.stringify({
        ref: registration.referenceId,
        token: registration.qrToken,
        uid: registration.pubgUid,
        event: 'PUBG_ET_ASSEMBLY',
      });

      qrDataUrl = await generateQRDataURL(qrPayload, {
        width: 320,
        margin: 3,
        darkColor: '#000000',
        lightColor: '#FFFFFF',
      });
    } catch (e) {
      console.warn('Could not generate admin QR payload:', e);
    }

    return NextResponse.json({
      registration: {
        ...registration,
        qrDataUrl,
      },
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
    const { status, teamName, category, paymentStatus } = body;

    const existing = await prisma.registration.findFirst({
      where: {
        OR: [{ id }, { referenceId: id }],
      },
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
      paymentStatus?: string;
      paymentApprovedAt?: Date | null;
      paymentApprovedBy?: string | null;
    } = {};

    if (status) {
      updateData.status = status;
      if (status === 'CONFIRMED') {
        // Automatically approve VIP payment as well if attendee is VIP
        if (existing.ticketTier === 'VIP') {
          updateData.paymentStatus = 'APPROVED';
          updateData.paymentApprovedAt = new Date();
          updateData.paymentApprovedBy = session.user.email || 'Head Admin';
        }
      }
    }
    if (teamName !== undefined) updateData.teamName = teamName;
    if (category) updateData.category = category;

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === 'APPROVED') {
        updateData.status = 'CONFIRMED';
        updateData.paymentApprovedAt = new Date();
        updateData.paymentApprovedBy = session.user.email || 'Head Admin';
      } else if (paymentStatus === 'REJECTED') {
        updateData.status = 'REJECTED';
        updateData.paymentApprovedAt = null;
        updateData.paymentApprovedBy = session.user.email || 'Head Admin';
      }
    }

    const updated = await prisma.registration.update({
      where: { id: existing.id },
      data: updateData,
    });

    // Write audit log entry
    await prisma.auditLog.create({
      data: {
        adminEmail: session.user.email || 'system',
        action: paymentStatus
          ? `VIP_PAYMENT_${paymentStatus}`
          : status
          ? `REGISTRATION_${status}`
          : 'REGISTRATION_UPDATED',
        targetId: existing.id,
        details: JSON.stringify({
          referenceId: existing.referenceId,
          previousStatus: existing.status,
          previousPaymentStatus: existing.paymentStatus,
          newStatus: updateData.status || existing.status,
          newPaymentStatus: updateData.paymentStatus || existing.paymentStatus,
          admin: session.user.email,
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
