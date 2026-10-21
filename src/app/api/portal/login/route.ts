import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fullName = (body.fullName || '').trim();
    const phoneNumber = (body.phoneNumber || '').trim();

    if (!fullName || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Full name and phone number are required to log in.' },
        { status: 400 }
      );
    }

    // Clean phone number (strip spaces, dashes, leading 0 or +251 for flexible matching)
    const cleanPhone = phoneNumber.replace(/[\s\-()]/g, '');
    const phoneSuffix = cleanPhone.length > 9 ? cleanPhone.slice(-9) : cleanPhone;

    // Search for matching registration by name and phone
    const registrations = await prisma.registration.findMany({
      where: {
        AND: [
          {
            OR: [
              { fullName: { equals: fullName } },
              { fullName: { contains: fullName } },
              { inGameName: { equals: fullName } },
            ],
          },
          {
            phoneNumber: { contains: phoneSuffix },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (!registrations || registrations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No registration record found matching that name and phone number. Please check your spelling or register first.',
        },
        { status: 404 }
      );
    }

    const registration = registrations[0];

    return NextResponse.json({
      success: true,
      data: {
        id: registration.id,
        referenceId: registration.referenceId,
        fullName: registration.fullName,
        inGameName: registration.inGameName,
        pubgUid: registration.pubgUid,
        phoneNumber: registration.phoneNumber,
        countryCode: registration.countryCode,
        cityRegion: registration.cityRegion,
        category: registration.category,
        ticketTier: registration.ticketTier,
        status: registration.status,
        phoneVerified: registration.phoneVerified,
        createdAt: registration.createdAt,
      },
    });
  } catch (error) {
    console.error('[ATTENDEE_LOGIN_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Server error processing attendee login.' },
      { status: 500 }
    );
  }
}
