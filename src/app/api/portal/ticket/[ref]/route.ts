import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQRDataURL } from '@/lib/qr';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params;
    if (!ref) {
      return NextResponse.json({ success: false, error: 'Reference ID is required' }, { status: 400 });
    }

    const reg = await prisma.registration.findUnique({
      where: { referenceId: ref },
    });

    if (!reg) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }

    let qrDataUrl = null;
    // Only generate and provide the optical QR ticket if the registration has been CONFIRMED/ACCEPTED by Admin!
    if (reg.status === 'CONFIRMED' || reg.status === 'CHECKED_IN') {
      const qrPayload = JSON.stringify({
        ref: reg.referenceId,
        token: reg.qrToken,
        uid: reg.pubgUid,
        ign: reg.inGameName,
        event: 'PUBG_ET_ASSEMBLY',
      });

      qrDataUrl = await generateQRDataURL(qrPayload, {
        width: 320,
        margin: 3,
        darkColor: '#000000',
        lightColor: '#FFFFFF',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: reg.id,
        referenceId: reg.referenceId,
        fullName: reg.fullName,
        inGameName: reg.inGameName,
        pubgUid: reg.pubgUid,
        phoneNumber: reg.phoneNumber,
        countryCode: reg.countryCode,
        cityRegion: reg.cityRegion,
        category: reg.category,
        teamName: reg.teamName,
        tournamentInterest: reg.tournamentInterest,
        ticketTier: reg.ticketTier,
        status: reg.status,
        paymentStatus: reg.paymentStatus,
        createdAt: reg.createdAt,
        checkedInAt: reg.checkedInAt,
        qrDataUrl,
      },
    });
  } catch (error) {
    console.error('[PORTAL_TICKET_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Error fetching ticket pass' }, { status: 500 });
  }
}
