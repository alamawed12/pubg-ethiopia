import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [priceSetting, enabledSetting, capacitySetting, vipCount, standardCount, totalRegistrations] = await Promise.all([
      prisma.systemSetting.findUnique({ where: { key: 'vip_ticket_price' } }),
      prisma.systemSetting.findUnique({ where: { key: 'vip_ticket_enabled' } }),
      prisma.systemSetting.findUnique({ where: { key: 'max_capacity' } }),
      prisma.registration.count({ where: { ticketTier: 'VIP' } }),
      prisma.registration.count({ where: { ticketTier: 'STANDARD' } }),
      prisma.registration.count(),
    ]);

    const vipPrice = priceSetting ? parseInt(priceSetting.value, 10) : 500;
    const vipEnabled = enabledSetting ? enabledSetting.value === 'true' : true;
    const maxCapacity = capacitySetting ? parseInt(capacitySetting.value, 10) : 300;

    return NextResponse.json({
      success: true,
      vipPrice: isNaN(vipPrice) ? 500 : vipPrice,
      vipEnabled,
      maxCapacity: isNaN(maxCapacity) ? 300 : maxCapacity,
      stats: {
        vipCount,
        standardCount,
        totalRegistrations,
        estimatedVipRevenue: vipCount * (isNaN(vipPrice) ? 500 : vipPrice),
      },
    });
  } catch (error) {
    console.error('[ADMIN_SETTINGS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { vipPrice, vipEnabled, maxCapacity } = body;

    if (maxCapacity !== undefined) {
      const parsedCapacity = parseInt(String(maxCapacity), 10);
      if (isNaN(parsedCapacity) || parsedCapacity < 1) {
        return NextResponse.json({ error: 'Invalid maximum attendee capacity' }, { status: 400 });
      }

      await prisma.systemSetting.upsert({
        where: { key: 'max_capacity' },
        update: { value: String(parsedCapacity) },
        create: { key: 'max_capacity', value: String(parsedCapacity) },
      });
    }

    if (vipPrice !== undefined) {
      const parsedPrice = parseInt(String(vipPrice), 10);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json({ error: 'Invalid price amount' }, { status: 400 });
      }

      await prisma.systemSetting.upsert({
        where: { key: 'vip_ticket_price' },
        update: { value: String(parsedPrice) },
        create: { key: 'vip_ticket_price', value: String(parsedPrice) },
      });
    }

    if (vipEnabled !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'vip_ticket_enabled' },
        update: { value: String(Boolean(vipEnabled)) },
        create: { key: 'vip_ticket_enabled', value: String(Boolean(vipEnabled)) },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminEmail: session.user.email || session.user.name || 'admin',
        action: 'UPDATE_SYSTEM_SETTINGS',
        details: JSON.stringify({ vipPrice, vipEnabled, maxCapacity }),
      },
    });

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('[ADMIN_SETTINGS_POST_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
