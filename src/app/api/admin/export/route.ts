import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status')?.trim();
    const category = searchParams.get('category')?.trim();

    const where: Prisma.RegistrationWhereInput = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    const registrations = await prisma.registration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Reference ID',
      'Full Name',
      'In-Game Name',
      'PUBG UID',
      'Country Code',
      'Phone Number',
      'City / Region',
      'Category',
      'Team Name',
      'Tournament Interest',
      'Squad Details',
      'Status',
      'Phone Verified',
      'Checked In At',
      'Checked In By',
      'Registered At',
    ];

    const rows = registrations.map((reg) => [
      escapeCsvCell(reg.referenceId),
      escapeCsvCell(reg.fullName),
      escapeCsvCell(reg.inGameName),
      escapeCsvCell(reg.pubgUid),
      escapeCsvCell(reg.countryCode),
      escapeCsvCell(reg.phoneNumber),
      escapeCsvCell(reg.cityRegion),
      escapeCsvCell(reg.category),
      escapeCsvCell(reg.teamName || 'N/A'),
      escapeCsvCell(reg.tournamentInterest ? 'YES' : 'NO'),
      escapeCsvCell(reg.squadDetails || 'N/A'),
      escapeCsvCell(reg.status),
      escapeCsvCell(reg.phoneVerified ? 'VERIFIED' : 'UNVERIFIED'),
      escapeCsvCell(reg.checkedInAt ? reg.checkedInAt.toISOString() : ''),
      escapeCsvCell(reg.checkedInBy || ''),
      escapeCsvCell(reg.createdAt.toISOString()),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `pubg-assembly-registrations-${timestamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[ADMIN_EXPORT_CSV_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to generate export file' },
      { status: 500 }
    );
  }
}
