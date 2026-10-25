import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    const map = new Map<string, string>();
    settings.forEach((s) => map.set(s.key, s.value));

    const vipPrice = map.has('vip_ticket_price') ? parseInt(map.get('vip_ticket_price')!, 10) : 500;
    const vipEnabled = map.has('vip_ticket_enabled') ? map.get('vip_ticket_enabled') === 'true' : true;
    const maxCapacity = map.has('max_capacity') ? parseInt(map.get('max_capacity')!, 10) : 300;
    const heroAttendeesDisplay = map.get('hero_attendees_display') || (map.has('max_capacity') ? `${map.get('max_capacity')}+` : '100-1000');

    return NextResponse.json({
      success: true,
      vipPrice: isNaN(vipPrice) ? 500 : vipPrice,
      vipEnabled,
      maxCapacity: isNaN(maxCapacity) ? 300 : maxCapacity,
      heroAttendeesDisplay,
      currency: 'ETB',
      // Announcement
      announcement: {
        enabled: map.get('announcement_enabled') === 'true',
        type: map.get('announcement_type') || 'warning',
        title: map.get('announcement_title') || 'IMPORTANT EVENT ANNOUNCEMENT',
        message: map.get('announcement_message') || 'Welcome to PUBG MOBILE Community Assembly Ethiopia! Registrations are open. Secure your pass today.',
        linkText: map.get('announcement_link_text') || 'REGISTER NOW',
        linkUrl: map.get('announcement_link_url') || '/register',
      },
      // Event Metadata
      eventDate: map.get('event_date') || 'DATE: TO BE ANNOUNCED',
      eventVenue: map.get('event_venue') || 'ADDIS ABABA, ETHIOPIA',
      registrationOpen: map.has('registration_open') ? map.get('registration_open') === 'true' : true,
      // Official Payment Accounts
      telebirrNumber: map.get('telebirr_number') || '+251950986841',
      telebirrName: map.get('telebirr_name') || 'Tsige Dagne',
      awashAccount: map.get('awash_account') || '013201378990300',
      awashName: map.get('awash_name') || 'Tsige Dagne',
      // Community Socials
      telegramLink: map.get('telegram_link') || 'https://t.me/pubgm_eth',
      telegramSupport: map.get('telegram_support') || 'https://t.me/pubgmethsupport',
      discordLink: map.get('discord_link') || 'https://discord.gg/pubgethiopia',
      // Sponsors Marquee
      sponsorsEnabled: map.has('sponsors_enabled') ? map.get('sponsors_enabled') === 'true' : true,
      sponsorsTitle: map.get('sponsors_title') || 'OFFICIAL SPONSORS & PARTNERS',
      sponsorsSubtitle: map.get('sponsors_subtitle') || 'POWERING THE PUBG MOBILE COMMUNITY ASSEMBLY ETHIOPIA',
      sponsors: (() => {
        try {
          if (map.has('sponsors_data')) return JSON.parse(map.get('sponsors_data')!);
        } catch {
          // fallback
        }
        return [
          {
            id: 'sp-1',
            name: 'PUBG MOBILE',
            logo: '/images/pubg-mobile-logo.png',
          },
          {
            id: 'sp-2',
            name: 'KRAFTON & PARTNERS',
            logo: '/images/krafton-partner-logos.png',
          },
          {
            id: 'sp-3',
            name: 'PUBG COMMUNITY',
            logo: '/images/community-assembly-logo.png',
          },
          {
            id: 'sp-4',
            name: 'PUBG ESPORTS',
            logo: '/images/pubg-helmet-logo.png',
          },
        ];
      })(),
    });
  } catch {
    return NextResponse.json({
      success: true,
      vipPrice: 500,
      vipEnabled: true,
      maxCapacity: 300,
      heroAttendeesDisplay: '100-1000',
      currency: 'ETB',
      announcement: {
        enabled: false,
        type: 'warning',
        title: 'IMPORTANT EVENT ANNOUNCEMENT',
        message: '',
        linkText: 'REGISTER NOW',
        linkUrl: '/register',
      },
      eventDate: 'DATE: TO BE ANNOUNCED',
      eventVenue: 'ADDIS ABABA, ETHIOPIA',
      registrationOpen: true,
      telebirrNumber: '+251950986841',
      telebirrName: 'Tsige Dagne',
      awashAccount: '013201378990300',
      awashName: 'Tsige Dagne',
      telegramLink: 'https://t.me/pubgm_eth',
      discordLink: 'https://discord.gg/pubgethiopia',
      sponsorsEnabled: true,
      sponsorsTitle: 'OFFICIAL SPONSORS & PARTNERS',
      sponsorsSubtitle: '',
      sponsors: [
        {
          id: 'sp-1',
          name: 'PUBG MOBILE',
          logo: '/images/pubg-mobile-logo.png',
        },
        {
          id: 'sp-2',
          name: 'KRAFTON & PARTNERS',
          logo: '/images/krafton-partner-logos.png',
        },
        {
          id: 'sp-3',
          name: 'PUBG COMMUNITY',
          logo: '/images/community-assembly-logo.png',
        },
        {
          id: 'sp-4',
          name: 'PUBG ESPORTS',
          logo: '/images/pubg-helmet-logo.png',
        },
      ],
    });
  }
}
