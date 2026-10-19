import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Secret key to prevent unauthorized spoofing of SMS webhook
const SMS_WEBHOOK_SECRET = process.env.SMS_WEBHOOK_SECRET || 'pmca_telebirr_secret_2026';

/**
 * Intelligent Ethiopian Bank & Telebirr SMS Parser
 */
function parsePaymentSms(smsText: string, sender: string) {
  const text = smsText.trim();
  const lower = text.toLowerCase();
  const senderLower = (sender || '').toLowerCase();

  let paymentMethod = 'TELEBIRR';
  if (
    senderLower.includes('awash') ||
    lower.includes('awash') ||
    lower.includes('013201378990300')
  ) {
    paymentMethod = 'AWASH_BANK';
  } else if (
    senderLower.includes('127') ||
    senderLower.includes('telebirr') ||
    lower.includes('telebirr') ||
    lower.includes('mp')
  ) {
    paymentMethod = 'TELEBIRR';
  }

  // 1. Extract Transaction ID / Reference Code
  // Telebirr format: e.g. MP261020.1234.A56789 or TXN / Ref / No
  let txnCode = '';

  const telebirrCodeMatch = text.match(/\b(MP\d{6}\.\d{4}\.[A-Za-z0-9]+)\b/i);
  if (telebirrCodeMatch) {
    txnCode = telebirrCodeMatch[1].toUpperCase();
  } else {
    const txnMatch = text.match(
      /(?:transaction\s*id|trans\s*id|txn\s*id|ref\s*no|ref|txn|reference)[:\s#]*([A-Za-z0-9.-]{6,30})/i
    );
    if (txnMatch) {
      txnCode = txnMatch[1].toUpperCase();
    }
  }

  // 2. Extract Amount (ETB or Birr)
  let amount = 0;
  const amountMatch = text.match(
    /(?:credited\s*with|received|credited|transfer(?:red)?|amount|payment\s*of)?\s*(?:ETB|Birr|ብር)?\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:ETB|Birr|ብር)?/i
  );

  if (amountMatch) {
    const rawNum = amountMatch[1].replace(/,/g, '');
    const parsed = parseFloat(rawNum);
    if (!isNaN(parsed) && parsed > 0) {
      amount = parsed;
    }
  }

  // 3. Extract Payer Name / Phone if present
  let payerName = '';
  let payerPhone = '';
  const payerMatch = text.match(/from\s+([A-Za-z\s]+?)(?:\s*\(([\d+]+)\)|\s+on\s+|\s+your\s+|\s*\.)/i);
  if (payerMatch) {
    payerName = payerMatch[1].trim();
    if (payerMatch[2]) {
      payerPhone = payerMatch[2].trim();
    }
  }

  return {
    txnCode,
    amount,
    paymentMethod,
    payerName,
    payerPhone,
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Secret Key for security
    const authHeader =
      req.headers.get('x-api-key') ||
      req.headers.get('secret') ||
      req.headers.get('authorization') ||
      req.nextUrl.searchParams.get('secret') ||
      '';

    const cleanSecret = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (cleanSecret !== SMS_WEBHOOK_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized webhook request. Invalid secret key.' },
        { status: 401 }
      );
    }

    // 2. Parse Incoming Forwarder Body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Expected JSON payload from SMS forwarder.' },
        { status: 400 }
      );
    }

    // Support various standard Android SMS forwarder JSON formats
    const smsText =
      body.text ||
      body.message ||
      body.content ||
      body.body ||
      body.sms ||
      body.smsContent ||
      '';

    const sender =
      body.from ||
      body.sender ||
      body.senderPhone ||
      body.phone ||
      body.address ||
      '';

    if (!smsText || typeof smsText !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing SMS text in payload.' },
        { status: 400 }
      );
    }

    // 3. Parse Telebirr / Awash Bank SMS
    const { txnCode, amount, paymentMethod, payerName, payerPhone } =
      parsePaymentSms(smsText, sender);

    if (!txnCode) {
      return NextResponse.json(
        {
          success: false,
          warning: 'No valid transaction reference could be extracted from SMS.',
          rawSms: smsText,
        },
        { status: 200 }
      );
    }

    // 4. Save into VerifiedPayment Database Ledger
    const verifiedRecord = await prisma.verifiedPayment.upsert({
      where: { txnCode },
      update: {
        amount: amount || 500,
        rawSms: smsText,
        paymentMethod,
      },
      create: {
        txnCode,
        amount: amount || 500,
        paymentMethod,
        senderName: payerName || null,
        senderPhone: payerPhone || null,
        rawSms: smsText,
        isClaimed: false,
      },
    });

    // 5. Check if any VIP registration is waiting for this exact transaction code!
    // Automatic Match & Instant Approval
    const pendingAttendee = await prisma.registration.findFirst({
      where: {
        ticketTier: 'VIP',
        paymentTxnCode: txnCode,
        status: { in: ['PENDING', 'WAITLISTED'] },
      },
    });

    let autoApproved = false;
    if (pendingAttendee) {
      // Instantly Approve Attendee!
      await prisma.registration.update({
        where: { id: pendingAttendee.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'APPROVED',
          paymentApprovedAt: new Date(),
          paymentApprovedBy: 'AUTOMATED_SMS_BOT',
        },
      });

      // Mark payment as claimed
      await prisma.verifiedPayment.update({
        where: { txnCode },
        data: {
          isClaimed: true,
          claimedByRefId: pendingAttendee.referenceId,
        },
      });

      // Write Audit Log
      await prisma.auditLog.create({
        data: {
          adminEmail: 'SMS_BOT_AUTOMATION',
          action: 'VIP_PAYMENT_AUTOMATICALLY_APPROVED',
          targetId: pendingAttendee.id,
          details: JSON.stringify({
            txnCode,
            amount: verifiedRecord.amount,
            referenceId: pendingAttendee.referenceId,
            fullName: pendingAttendee.fullName,
            method: paymentMethod,
          }),
        },
      });

      autoApproved = true;
    }

    return NextResponse.json({
      success: true,
      message: 'SMS successfully processed by automated payment bot.',
      data: {
        txnCode,
        amount: verifiedRecord.amount,
        paymentMethod,
        autoApproved,
        attendeeRef: pendingAttendee ? pendingAttendee.referenceId : null,
      },
    });
  } catch (error: unknown) {
    console.error('[SMS_WEBHOOK_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Webhook processing error: ${message}` },
      { status: 500 }
    );
  }
}

// GET handler to easily test or check webhook health
export async function GET(req: NextRequest) {
  const secretParam = req.nextUrl.searchParams.get('secret');
  if (secretParam !== SMS_WEBHOOK_SECRET) {
    return NextResponse.json(
      {
        status: 'ONLINE',
        endpoint: '/api/webhooks/sms',
        requiresSecret: true,
        note: 'Provide ?secret=pmca_telebirr_secret_2026 or header to authenticate.',
      },
      { status: 200 }
    );
  }

  // Return count of verified payments for admin
  const totalVerified = await prisma.verifiedPayment.count();
  const unclaimed = await prisma.verifiedPayment.count({ where: { isClaimed: false } });

  return NextResponse.json({
    status: 'AUTHENTICATED_AND_ACTIVE',
    totalSmsPaymentsLogged: totalVerified,
    unclaimedPayments: unclaimed,
    defaultSecret: SMS_WEBHOOK_SECRET,
  });
}
