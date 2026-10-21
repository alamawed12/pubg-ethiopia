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

    // 3. Capacity & Quota Management
    const [existingCount, capacitySetting] = await Promise.all([
      prisma.registration.count(),
      prisma.systemSetting.findUnique({ where: { key: 'max_capacity' } }),
    ]);

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

    // 7. Process Biometric AI Face Match & VIP Approvals
    const rawTier = (rawBody as Record<string, unknown>).ticketTier === 'VIP' ? 'VIP' : 'STANDARD';
    const submittedTxnCode = (((rawBody as Record<string, unknown>).paymentTxnCode as string) || '').trim().toUpperCase();

    const rawSelfieImage = ((rawBody as Record<string, unknown>).selfieImage as string) || null;
    const rawFaceScore = Number((rawBody as Record<string, unknown>).faceMatchScore) || 0;
    const rawFaceStatus = ((rawBody as Record<string, unknown>).faceMatchStatus as string) || 'NOT_VERIFIED';

    let initialPaymentStatus = rawTier === 'VIP' ? 'PENDING_APPROVAL' : 'UNPAID';
    let initialRegistrationStatus = registrationStatus;
    let autoApproved = false;

    // RULE 1: For STANDARD ticket tier:
    // If AI Biometric Face Match succeeded (score >= 70 or status === 'PASSED')
    // AND capacity is available: INSTANT AUTOMATED APPROVAL!
    if (rawTier === 'STANDARD' && (rawFaceStatus === 'PASSED' || rawFaceScore >= 70) && registrationStatus !== 'WAITLISTED') {
      initialRegistrationStatus = 'CONFIRMED';
      autoApproved = true;
    }

    // RULE 2: For VIP ticket tier:
    // Check SMS Bot instant transaction match
    if (rawTier === 'VIP' && submittedTxnCode) {
      const matchedPayment = await prisma.verifiedPayment.findFirst({
        where: {
          txnCode: submittedTxnCode,
          isClaimed: false,
        },
      });

      if (matchedPayment) {
        initialPaymentStatus = 'APPROVED';
        initialRegistrationStatus = 'CONFIRMED';
        autoApproved = true;

        await prisma.verifiedPayment.update({
          where: { id: matchedPayment.id },
          data: {
            isClaimed: true,
            claimedByRefId: referenceId,
          },
        });
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
        squadDetails: data.squadDetails || null,
        idFrontImage: ((rawBody as Record<string, unknown>).idFrontImage as string) || null,
        idBackImage: ((rawBody as Record<string, unknown>).idBackImage as string) || null,
        selfieImage: rawSelfieImage,
        faceMatchScore: rawFaceScore,
        faceMatchStatus: rawFaceStatus,
        faceMatchDetails: rawTier === 'STANDARD' && autoApproved
          ? `Instant Approval: AI Biometric Face Match Verified (${rawFaceScore}%).`
          : `AI Face Match: ${rawFaceScore}% (${rawFaceStatus}).`,
        ticketTier: rawTier,
        vipPrice: rawTier === 'VIP' ? Number((rawBody as Record<string, unknown>).vipPrice || 500) : null,
        paymentMethod: ((rawBody as Record<string, unknown>).paymentMethod as string) || null,
        paymentTxnCode: submittedTxnCode || null,
        telegramUsername: ((rawBody as Record<string, unknown>).telegramUsername as string) || null,
        paymentReceiptImage: ((rawBody as Record<string, unknown>).paymentReceiptImage as string) || null,
        paymentStatus: initialPaymentStatus,
        status: initialRegistrationStatus,
        paymentApprovedAt: autoApproved ? new Date() : null,
        paymentApprovedBy: autoApproved ? (rawTier === 'STANDARD' ? 'AI_BIOMETRIC_KYC_ENGINE' : 'AUTOMATED_SMS_BOT') : null,
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
          autoApproved,
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
