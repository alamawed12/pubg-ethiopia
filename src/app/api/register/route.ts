import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registrationSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { generateReferenceId, generateQRToken } from '@/lib/reference';
import { generateQRDataURL } from '@/lib/qr';

// Allow larger body for base64 ID image uploads
export const maxDuration = 30;


const MAX_CAPACITY = 300;
const CAPACITY_WARNING_THRESHOLD = 270;

/**
 * Extracts client IP from incoming request headers.
 */
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
    // 1. Rate Limiting Check (10 requests per 15 minutes per IP)
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

    // 2. Parse & Validate Payload with Zod
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
    const existingCount = await prisma.registration.count();

    if (existingCount >= CAPACITY_WARNING_THRESHOLD && existingCount < MAX_CAPACITY) {
      console.warn(
        `[CAPACITY_ALERT] Registration count (${existingCount}/${MAX_CAPACITY}) is approaching maximum venue threshold.`
      );
    }

    const registrationStatus = existingCount >= MAX_CAPACITY ? 'WAITLISTED' : 'PENDING';

    // 4. Check for Existing Duplicate Registrations
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
            error:
              'A player with this PUBG MOBILE UID is already registered for the assembly.',
          },
          { status: 400 }
        );
      }
      if (duplicate.phoneNumber === data.phoneNumber) {
        return NextResponse.json(
          {
            success: false,
            error:
              'A registration with this phone number already exists in our system.',
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

    // 6. Generate QR Code Data URL with security payload
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

    // 7. Persist to SQLite Database via Prisma
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
        idFrontImage: (rawBody as Record<string, unknown>).idFrontImage as string || null,
        idBackImage: (rawBody as Record<string, unknown>).idBackImage as string || null,
        ticketTier: (rawBody as Record<string, unknown>).ticketTier === 'VIP' ? 'VIP' : 'STANDARD',
        vipPrice: (rawBody as Record<string, unknown>).ticketTier === 'VIP' ? Number((rawBody as Record<string, unknown>).vipPrice || 500) : null,
        status: registrationStatus,
      },
    });

    // 8. Return Confirmation Response
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
        },
      },
      { status: 201 }
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
