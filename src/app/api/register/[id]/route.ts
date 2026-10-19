import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQRDataURL } from '@/lib/qr';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const identifier = resolvedParams?.id?.trim();

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Registration identifier is required.' },
        { status: 400 }
      );
    }

    // Lookup by referenceId (e.g., PUBG-ET-XXXXXX) or internal CUID
    const registration = await prisma.registration.findFirst({
      where: {
        OR: [
          { referenceId: identifier.toUpperCase() },
          { id: identifier },
        ],
      },
      select: {
        id: true,
        referenceId: true,
        qrToken: true,
        fullName: true,
        inGameName: true,
        pubgUid: true,
        category: true,
        teamName: true,
        tournamentInterest: true,
        ticketTier: true,
        vipPrice: true,
        paymentStatus: true,
        paymentMethod: true,
        paymentTxnCode: true,
        telegramUsername: true,
        status: true,
        checkedInAt: true,
        createdAt: true,
      },
    });

    if (!registration) {
      return NextResponse.json(
        {
          success: false,
          error: `Registration with ID '${identifier}' could not be found.`,
        },
        { status: 404 }
      );
    }

    // Generate fresh QR code data URL for attendee verification
    const qrPayload = JSON.stringify({
      ref: registration.referenceId,
      token: registration.qrToken,
      uid: registration.pubgUid,
      event: 'PUBG_ET_ASSEMBLY',
    });

    let qrDataUrl = '';
    try {
      qrDataUrl = await generateQRDataURL(qrPayload, {
        width: 320,
        margin: 3,
        darkColor: '#000000',
        lightColor: '#FFFFFF',
      });
    } catch {
      // Non-fatal if QR fails to generate in GET view
      qrDataUrl = '';
    }

    // Return sanitized data (omit internal qrToken from response body)
    return NextResponse.json({
      success: true,
      data: {
        id: registration.id,
        referenceId: registration.referenceId,
        fullName: registration.fullName,
        inGameName: registration.inGameName,
        category: registration.category,
        teamName: registration.teamName,
        tournamentInterest: registration.tournamentInterest,
        status: registration.status,
        checkedInAt: registration.checkedInAt,
        createdAt: registration.createdAt,
        qrDataUrl,
      },
    });
  } catch (error: unknown) {
    console.error('[API_GET_REGISTRATION_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An internal server error occurred while retrieving registration data.',
      },
      { status: 500 }
    );
  }
}
