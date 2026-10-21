import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [vipPriceSetting, vipEnabledSetting, capacitySetting] = await Promise.all([
      prisma.systemSetting.findUnique({ where: { key: 'vip_ticket_price' } }),
      prisma.systemSetting.findUnique({ where: { key: 'vip_ticket_enabled' } }),
      prisma.systemSetting.findUnique({ where: { key: 'max_capacity' } }),
    ]);

    const vipPrice = vipPriceSetting ? parseInt(vipPriceSetting.value, 10) : 500;
    const vipEnabled = vipEnabledSetting ? vipEnabledSetting.value === 'true' : true;
    const maxCapacity = capacitySetting ? parseInt(capacitySetting.value, 10) : 300;

    return NextResponse.json({
      success: true,
      vipPrice: isNaN(vipPrice) ? 500 : vipPrice,
      vipEnabled,
      maxCapacity: isNaN(maxCapacity) ? 300 : maxCapacity,
      currency: 'ETB',
    });
  } catch {
    return NextResponse.json({
      success: true,
      vipPrice: 500,
      vipEnabled: true,
      maxCapacity: 300,
      currency: 'ETB',
    });
  }
}
