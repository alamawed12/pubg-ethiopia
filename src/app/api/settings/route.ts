import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const vipPriceSetting = await prisma.systemSetting.findUnique({
      where: { key: 'vip_ticket_price' },
    });

    const vipEnabledSetting = await prisma.systemSetting.findUnique({
      where: { key: 'vip_ticket_enabled' },
    });

    const vipPrice = vipPriceSetting ? parseInt(vipPriceSetting.value, 10) : 500;
    const vipEnabled = vipEnabledSetting ? vipEnabledSetting.value === 'true' : true;

    return NextResponse.json({
      success: true,
      vipPrice: isNaN(vipPrice) ? 500 : vipPrice,
      vipEnabled,
      currency: 'ETB',
    });
  } catch {
    return NextResponse.json({
      success: true,
      vipPrice: 500,
      vipEnabled: true,
      currency: 'ETB',
    });
  }
}
