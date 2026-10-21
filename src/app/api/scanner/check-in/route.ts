import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticket, staffName, secretKey } = body;

    const validScannerSecret = process.env.SCANNER_API_KEY || 'pubget_gate_2026_scanner';
    const validAdminPass = process.env.ADMIN_PASSWORD || 'pubget1213';

    const authHeader = request.headers.get('authorization');
    const headerKey = request.headers.get('x-scanner-key');

    const isAuthorized =
      secretKey === validScannerSecret ||
      secretKey === validAdminPass ||
      headerKey === validScannerSecret ||
      headerKey === validAdminPass ||
      (authHeader && authHeader.startsWith('Bearer ') && (
        authHeader.slice(7) === validScannerSecret ||
        authHeader.slice(7) === validAdminPass
      ));

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, status: 'UNAUTHORIZED', error: 'Invalid scanner access key' },
        { status: 401 }
      );
    }

    if (!ticket || typeof ticket !== 'string') {
      return NextResponse.json(
        { success: false, status: 'BAD_REQUEST', error: 'Missing ticket data' },
        { status: 400 }
      );
    }

    // Parse ticket string (support raw referenceId, token, or JSON payload from QR)
    let searchKey = ticket.trim();
    try {
      const parsed = JSON.parse(searchKey);
      if (parsed && typeof parsed === 'object') {
        searchKey = parsed.ref || parsed.token || parsed.uid || searchKey;
      }
    } catch {
      const match = searchKey.match(/PUBG-ET-[A-Z0-9]+/i);
      if (match) {
        searchKey = match[0].toUpperCase();
      }
    }

    // Lookup attendee
    const registration = await prisma.registration.findFirst({
      where: {
        OR: [
          { referenceId: searchKey },
          { qrToken: searchKey },
          { id: searchKey },
          { pubgUid: searchKey },
        ],
      },
    });

    if (!registration) {
      return NextResponse.json(
        {
          success: false,
          status: 'INVALID',
          message: 'COUNTERFEIT / UNRECOGNIZED PASS — NOT FOUND IN DATABASE',
        },
        { status: 404 }
      );
    }

    // Check if VIP pass is awaiting payment approval
    if (registration.ticketTier === 'VIP' && registration.paymentStatus !== 'APPROVED') {
      return NextResponse.json(
        {
          success: false,
          status: 'VIP_UNAPPROVED',
          message: `VIP PASS UNAPPROVED — Payment status is ${registration.paymentStatus}. Needs admin approval in Payments Hub.`,
          registration,
        },
        { status: 403 }
      );
    }

    // Check for duplicate check-in
    if (registration.status === 'CHECKED_IN' || registration.checkedInAt) {
      return NextResponse.json(
        {
          success: false,
          status: 'ALREADY_CHECKED_IN',
          message: `ALREADY CHECKED IN on ${new Date(registration.checkedInAt || '').toLocaleTimeString()} by ${registration.checkedInBy || 'Gate Staff'}`,
          isDuplicate: true,
          checkedInAt: registration.checkedInAt,
          checkedInBy: registration.checkedInBy,
          registration,
        },
        { status: 409 }
      );
    }

    const checkInTime = new Date();
    const officer = (staffName || request.headers.get('x-staff-name') || 'Android Gate Scanner').trim();

    // Mark as checked in
    const updated = await prisma.registration.update({
      where: { id: registration.id },
      data: {
        status: 'CHECKED_IN',
        checkedInAt: checkInTime,
        checkedInBy: officer,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        adminEmail: officer,
        action: 'CHECK_IN_ANDROID_APP',
        targetId: registration.id,
        details: JSON.stringify({
          referenceId: registration.referenceId,
          inGameName: registration.inGameName,
          fullName: registration.fullName,
          ticketTier: registration.ticketTier,
          officer,
          checkedInAt: checkInTime.toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      status: 'SUCCESS',
      message: 'GENUINE TICKET VERIFIED — ADMISSION GRANTED',
      registration: updated,
    });
  } catch (error) {
    console.error('[SCANNER_CHECK_IN_API_ERROR]', error);
    return NextResponse.json(
      { success: false, status: 'SERVER_ERROR', error: 'Internal gate scanner server error' },
      { status: 500 }
    );
  }
}
