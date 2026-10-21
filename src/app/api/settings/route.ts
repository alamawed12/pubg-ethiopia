import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [vipPriceSetting, vipEnabledSetting, capacitySetting, heroDisplaySetting] = await Promise.all([
      prisma.systemSetting.findUnique({ where: { key: 'vip_ticket_price' } }),
      prisma.systemSetting.findUnique({ where: { key: 'vip_ticket_enabled' } }),
      prisma.systemSetting.findUnique({ where: { key: 'max_capacity' } }),
      prisma.systemSetting.findUnique({ where: { key: 'hero_attendees_display' } }),
    ]);

    const vipPrice = vipPriceSetting ? parseInt(vipPriceSetting.value, 10) : 500;
    const vipEnabled = vipEnabledSetting ? vipEnabledSetting.value === 'true' : true;
    const maxCapacity = capacitySetting ? parseInt(capacitySetting.value, 10) : 300;
    const heroAttendeesDisplay = heroDisplaySetting?.value || (capacitySetting ? `${capacitySetting.value}+` : '300+');

    return NextResponse.json({
      success: true,
      vipPrice: isNaN(vipPrice) ? 500 : vipPrice,
      vipEnabled,
      maxCapacity: isNaN(maxCapacity) ? 300 : maxCapacity,
      heroAttendeesDisplay,
      currency: 'ETB',
    });
  } catch {
    return NextResponse.json({
      success: true,
      vipPrice: 500,
      vipEnabled: true,
      maxCapacity: 300,
      heroAttendeesDisplay: '300+',
      currency: 'ETB',
    });
  }
}
