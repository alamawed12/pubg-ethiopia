import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registrationSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { generateReferenceId, generateQRToken } from '@/lib/reference';
import { generateQRDataURL } from '@/lib/qr';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 30;

const DEFAULT_CAPACITY = 300;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const clientIp = getClientIp(req);
    const rateLimitResult = rateLimit(`reg_${clientIp}`, 10, 15 * 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Too many registration requests from this connection. Please wait a few minutes before trying again.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    // 2. Parse & Validate Payload
    let rawBody;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON payload in request body.' },
        { status: 400 }
      );
    }

    const parseResult = registrationSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const errorDetails = parseResult.error.issues.map((i) => i.message).join('. ');
      return NextResponse.json(
        {
          success: false,
          error: errorDetails || 'Invalid registration information provided.',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // 3. Capacity & Quota Management and Registration Gate Check
    const [existingCount, capacitySetting, regOpenSetting] = await Promise.all([
      prisma.registration.count(),
      prisma.systemSetting.findUnique({ where: { key: 'max_capacity' } }),
      prisma.systemSetting.findUnique({ where: { key: 'registration_open' } }),
    ]);

    // Check if registrations are currently placed on hold by Head Admin
    if (regOpenSetting && regOpenSetting.value === 'false') {
      return NextResponse.json(
        {
          success: false,
          error: 'Event registration is temporarily on hold by event organizers. Please check back later or visit your attendee portal.',
          isHeld: true,
        },
        { status: 403 }
      );
    }

    const maxCapacity = capacitySetting ? parseInt(capacitySetting.value, 10) : DEFAULT_CAPACITY;
    const capacityLimit = isNaN(maxCapacity) || maxCapacity < 1 ? DEFAULT_CAPACITY : maxCapacity;
    const registrationStatus = existingCount >= capacityLimit ? 'WAITLISTED' : 'PENDING';

    // 4. Duplicate Check
    const duplicate = await prisma.registration.findFirst({
      where: {
        OR: [{ pubgUid: data.pubgUid }, { phoneNumber: data.phoneNumber }],
      },
    });

    if (duplicate) {
      if (duplicate.pubgUid === data.pubgUid) {
        return NextResponse.json(
          {
            success: false,
            error: 'A player with this PUBG MOBILE UID is already registered for the assembly.',
          },
          { status: 400 }
        );
      }
      if (duplicate.phoneNumber === data.phoneNumber) {
        return NextResponse.json(
          {
            success: false,
            error: 'A registration with this phone number already exists in our system.',
          },
          { status: 400 }
        );
      }
    }

    // 5. Generate Unique Reference ID & QR Token
    let referenceId = generateReferenceId();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const existing = await prisma.registration.findUnique({
        where: { referenceId },
      });
      if (!existing) {
        isUnique = true;
      } else {
        referenceId = generateReferenceId();
        attempts++;
      }
    }

    const qrToken = generateQRToken();

    // 6. Generate QR Code Data URL
    const qrPayload = JSON.stringify({
      ref: referenceId,
      token: qrToken,
      uid: data.pubgUid,
      event: 'PUBG_ET_ASSEMBLY',
    });

    const qrDataUrl = await generateQRDataURL(qrPayload, {
      width: 320,
      margin: 3,
      darkColor: '#000000',
      lightColor: '#FFFFFF',
    });

    // 7. Process Category, Ticket Tier & Captured Face Photo
    const isCreator = data.category === 'content_creator';
    const isVolunteer = data.category === 'volunteer';

    // Content Creators automatically receive complimentary VIP. Volunteers receive Free Crew Pass.
    let rawTier = 'STANDARD';
    if (isCreator) {
      rawTier = 'VIP';
    } else if (isVolunteer) {
      rawTier = 'STANDARD';
    } else {
      rawTier = (rawBody as Record<string, unknown>).ticketTier === 'VIP' ? 'VIP' : 'STANDARD';
    }

    const submittedTxnCode = (((rawBody as Record<string, unknown>).paymentTxnCode as string) || '').trim().toUpperCase();

    // Consolidate Creator & Volunteer specific information into details
    let consolidatedDetails = data.squadDetails || '';
    if (isCreator) {
      const platform = ((rawBody as Record<string, unknown>).socialMediaPlatform as string) || 'Social';
      const link = ((rawBody as Record<string, unknown>).socialMediaLink as string) || '';
      const followers = ((rawBody as Record<string, unknown>).socialMediaFollowers as string) || '';
      consolidatedDetails = `[Content Creator] Platform: ${platform} | Link: ${link}${followers ? ` | Audience: ${followers}` : ''}${consolidatedDetails ? `\n${consolidatedDetails}` : ''}`;
    } else if (isVolunteer) {
      const role = ((rawBody as Record<string, unknown>).volunteerRole as string) || 'gate_security';
      const exp = ((rawBody as Record<string, unknown>).volunteerExperience as string) || '';
      consolidatedDetails = `[Volunteer Application] Role: ${role}${exp ? ` | Experience: ${exp}` : ''}${consolidatedDetails ? `\n${consolidatedDetails}` : ''}`;
    }

    // Both Standard and VIP registrations enter the Admin Review Queue.
    // The event administrators manually review the face photo side-by-side with the National ID.
    const isWaitlisted = registrationStatus === 'WAITLISTED';
    const initialRegistrationStatus = isWaitlisted ? 'WAITLISTED' : 'PENDING';
    const initialPaymentStatus = isCreator
      ? 'APPROVED' // Complimentary Creator VIP is approved for payment
      : isVolunteer
      ? 'UNPAID'
      : rawTier === 'VIP'
      ? 'PENDING_APPROVAL'
      : 'UNPAID';

    // Check SMS Bot transaction match if txn code provided
    if (rawTier === 'VIP' && !isCreator && submittedTxnCode) {
      try {
        const matchedPayment = await prisma.verifiedPayment.findFirst({
          where: {
            txnCode: submittedTxnCode,
            isClaimed: false,
          },
        });

        if (matchedPayment) {
          await prisma.verifiedPayment.update({
            where: { id: matchedPayment.id },
            data: {
              isClaimed: true,
              claimedByRefId: referenceId,
            },
          });
        }
      } catch (txnErr) {
        console.warn('[VERIFY_PAYMENT_TXN_WARN]', txnErr);
      }
    }

    // 8. Persist to Database via Prisma
    const newRegistration = await prisma.registration.create({
      data: {
        referenceId,
        qrToken,
        fullName: data.fullName,
        inGameName: data.inGameName,
        pubgUid: data.pubgUid,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode || '+251',
        cityRegion: data.cityRegion,
        category: data.category,
        teamName: data.teamName || null,
        tournamentInterest: data.tournamentInterest,
        squadDetails: consolidatedDetails || null,
        idFrontImage: ((rawBody as Record<string, unknown>).idFrontImage as string) || null,
        idBackImage: ((rawBody as Record<string, unknown>).idBackImage as string) || null,
        selfieImage: null,
        faceMatchScore: null,
        faceMatchStatus: 'PRIVACY_PROTECTED',
        faceMatchDetails: 'Privacy mode active: Facial biometric photo collection disabled for attendee privacy.',
        ticketTier: rawTier,
        vipPrice: rawTier === 'VIP' ? (isCreator ? 0 : Number((rawBody as Record<string, unknown>).vipPrice || 500)) : null,
        paymentMethod: isCreator ? 'COMPLIMENTARY_CREATOR' : isVolunteer ? 'FREE_VOLUNTEER' : ((rawBody as Record<string, unknown>).paymentMethod as string) || null,
        paymentTxnCode: submittedTxnCode || null,
        telegramUsername: ((rawBody as Record<string, unknown>).telegramUsername as string) || null,
        paymentReceiptImage: ((rawBody as Record<string, unknown>).paymentReceiptImage as string) || null,
        paymentStatus: initialPaymentStatus,
        status: initialRegistrationStatus,
        paymentApprovedAt: isCreator ? new Date() : null,
        paymentApprovedBy: isCreator ? 'SYSTEM_CREATOR_PERK' : null,
      },
    });

    // 9. Return Confirmation Response
    return NextResponse.json(
      {
        success: true,
        data: {
          referenceId: newRegistration.referenceId,
          qrToken: newRegistration.qrToken,
          qrDataUrl,
          status: newRegistration.status,
          fullName: newRegistration.fullName,
          inGameName: newRegistration.inGameName,
          category: newRegistration.category,
          ticketTier: newRegistration.ticketTier,
          vipPrice: newRegistration.vipPrice,
          paymentMethod: newRegistration.paymentMethod,
          paymentTxnCode: newRegistration.paymentTxnCode,
          telegramUsername: newRegistration.telegramUsername,
          paymentStatus: newRegistration.paymentStatus,
          faceMatchScore: newRegistration.faceMatchScore,
          faceMatchStatus: newRegistration.faceMatchStatus,
          autoApproved: false,
        },
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: unknown) {
    console.error('[API_REGISTER_ERROR]', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error occurred.';
    return NextResponse.json(
      {
        success: false,
        error: `Registration could not be completed: ${message}`,
      },
      { status: 500 }
    );
  }
}
