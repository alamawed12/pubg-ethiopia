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

    const [settingsList, vipCount, standardCount, totalRegistrations] = await Promise.all([
      prisma.systemSetting.findMany(),
      prisma.registration.count({ where: { ticketTier: 'VIP' } }),
      prisma.registration.count({ where: { ticketTier: 'STANDARD' } }),
      prisma.registration.count(),
    ]);

    const map = new Map<string, string>();
    settingsList.forEach((s) => map.set(s.key, s.value));

    const vipPrice = map.has('vip_ticket_price') ? parseInt(map.get('vip_ticket_price')!, 10) : 500;
    const vipEnabled = map.has('vip_ticket_enabled') ? map.get('vip_ticket_enabled') === 'true' : true;
    const maxCapacity = map.has('max_capacity') ? parseInt(map.get('max_capacity')!, 10) : 300;
    const heroAttendeesDisplay = map.get('hero_attendees_display') || (map.has('max_capacity') ? `${map.get('max_capacity')}+` : '100-1000');

    const rawKey = map.get('gemini_api_key') || process.env.GEMINI_API_KEY || '';
    const hasGeminiKey = Boolean(rawKey && rawKey.trim().length > 10);
    const maskedGeminiKey = hasGeminiKey ? `${rawKey.slice(0, 4)}••••••••${rawKey.slice(-4)}` : '';

    return NextResponse.json({
      success: true,
      vipPrice: isNaN(vipPrice) ? 500 : vipPrice,
      vipEnabled,
      maxCapacity: isNaN(maxCapacity) ? 300 : maxCapacity,
      heroAttendeesDisplay,
      hasGeminiKey,
      geminiApiKey: maskedGeminiKey,
      // Announcement controls
      announcementEnabled: map.get('announcement_enabled') === 'true',
      announcementType: map.get('announcement_type') || 'warning',
      announcementTitle: map.get('announcement_title') || 'IMPORTANT EVENT ANNOUNCEMENT',
      announcementMessage: map.get('announcement_message') || 'Welcome to PUBG MOBILE Community Assembly Ethiopia! Registrations are open. Secure your pass today.',
      announcementLinkText: map.get('announcement_link_text') || 'REGISTER NOW',
      announcementLinkUrl: map.get('announcement_link_url') || '/register',
      // Event Metadata
      eventDate: map.get('event_date') || 'DATE: TO BE ANNOUNCED',
      eventVenue: map.get('event_venue') || 'ADDIS ABABA, ETHIOPIA',
      registrationOpen: map.has('registration_open') ? map.get('registration_open') === 'true' : true,
      // Official Payment Accounts
      telebirrNumber: map.get('telebirr_number') || '+251950986841',
      telebirrName: map.get('telebirr_name') || 'Tsige Dagne',
      awashAccount: map.get('awash_account') || '013201378990300',
      awashName: map.get('awash_name') || 'Tsige Dagne',
      // Community links
      telegramLink: map.get('telegram_link') || 'https://t.me/pubgmethiopia',
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
            url: 'https://www.pubgmobile.com',
            tier: 'Official Title Sponsor',
          },
          {
            id: 'sp-2',
            name: 'Level Infinite',
            logo: '',
            url: 'https://www.levelinfinite.com',
            tier: 'Official Publisher',
          },
          {
            id: 'sp-3',
            name: 'Telebirr',
            logo: '',
            url: 'https://www.ethiotelecom.et/telebirr',
            tier: 'Official Payment Partner',
          },
          {
            id: 'sp-4',
            name: 'Awash Bank',
            logo: '',
            url: 'https://awashbank.com',
            tier: 'Official Banking Partner',
          },
        ];
      })(),
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
    const {
      action,
      vipPrice,
      vipEnabled,
      maxCapacity,
      heroAttendeesDisplay,
      geminiApiKey,
      announcementEnabled,
      announcementType,
      announcementTitle,
      announcementMessage,
      announcementLinkText,
      announcementLinkUrl,
      eventDate,
      eventVenue,
      registrationOpen,
      telebirrNumber,
      telebirrName,
      awashAccount,
      awashName,
      telegramLink,
      discordLink,
      sponsorsEnabled,
      sponsorsTitle,
      sponsorsSubtitle,
      sponsors,
    } = body;

    // Handle instant Gemini API Key test connection
    if (action === 'TEST_GEMINI') {
      let keyToTest = geminiApiKey ? String(geminiApiKey).trim() : '';
      if (!keyToTest || keyToTest.includes('••••')) {
        const storedKey = await prisma.systemSetting.findUnique({ where: { key: 'gemini_api_key' } });
        keyToTest = storedKey?.value || process.env.GEMINI_API_KEY || '';
      }

      if (!keyToTest) {
        return NextResponse.json({ success: false, error: 'No Gemini API key provided to test.' }, { status: 400 });
      }

      try {
        // Step 1: Query the models endpoint with the key to find active supported models
        let discoveredModels: string[] = [];
        try {
          const listRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${keyToTest}`
          );
          if (listRes.ok) {
            const listData = await listRes.json();
            const rawModels: Array<{ name: string; supportedGenerationMethods?: string[] }> = listData.models || [];
            discoveredModels = rawModels
              .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
              .map((m) => m.name.replace(/^models\//, ''));
          }
        } catch (listErr) {
          console.warn('[GEMINI_LIST_MODELS_WARN]', listErr);
        }

        // Prioritize models: flash models first, then any discovered model, then standard fallback list
        const candidates = [
          ...discoveredModels.filter((m) => m.includes('flash')),
          ...discoveredModels,
          'gemini-2.0-flash',
          'gemini-2.5-flash',
          'gemini-1.5-flash-latest',
          'gemini-1.5-flash',
          'gemini-pro',
          'gemini-1.5-pro',
        ];

        // Deduplicate
        const uniqueCandidates = Array.from(new Set(candidates));

        let success = false;
        let workingModel = '';
        let lastError = '';

        for (const model of uniqueCandidates) {
          try {
            const testRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToTest}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: 'Respond with OK.' }] }],
                }),
              }
            );

            if (testRes.ok) {
              success = true;
              workingModel = model;
              break;
            } else {
              lastError = await testRes.text();
            }
          } catch (modelErr) {
            lastError = modelErr instanceof Error ? modelErr.message : String(modelErr);
          }
        }

        if (success) {
          // Persist verified working model
          await prisma.systemSetting.upsert({
            where: { key: 'gemini_model_name' },
            update: { value: workingModel },
            create: { key: 'gemini_model_name', value: workingModel },
          });

          // Also save the key if it was passed cleanly
          if (geminiApiKey && !geminiApiKey.includes('••••')) {
            await prisma.systemSetting.upsert({
              where: { key: 'gemini_api_key' },
              update: { value: geminiApiKey.trim() },
              create: { key: 'gemini_api_key', value: geminiApiKey.trim() },
            });
          }

          return NextResponse.json({
            success: true,
            message: `Connected successfully to Google Gemini (${workingModel})! Anti-fraud biometric checks active.`,
          });
        } else {
          return NextResponse.json(
            { success: false, error: `Google API rejected the key: ${lastError.slice(0, 180)}` },
            { status: 400 }
          );
        }
      } catch (testErr) {
        return NextResponse.json(
          { success: false, error: `Connection failed: ${testErr instanceof Error ? testErr.message : String(testErr)}` },
          { status: 500 }
        );
      }
    }

    if (geminiApiKey !== undefined) {
      const cleanKey = String(geminiApiKey).trim();
      if (cleanKey && !cleanKey.includes('••••')) {
        await prisma.systemSetting.upsert({
          where: { key: 'gemini_api_key' },
          update: { value: cleanKey },
          create: { key: 'gemini_api_key', value: cleanKey },
        });
      }
    }

    if (heroAttendeesDisplay !== undefined) {
      const displayVal = String(heroAttendeesDisplay).trim();
      await prisma.systemSetting.upsert({
        where: { key: 'hero_attendees_display' },
        update: { value: displayVal },
        create: { key: 'hero_attendees_display', value: displayVal },
      });
    }

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

    // Announcement controls
    if (announcementEnabled !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'announcement_enabled' },
        update: { value: String(Boolean(announcementEnabled)) },
        create: { key: 'announcement_enabled', value: String(Boolean(announcementEnabled)) },
      });
    }

    if (announcementType !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'announcement_type' },
        update: { value: String(announcementType).trim() },
        create: { key: 'announcement_type', value: String(announcementType).trim() },
      });
    }

    if (announcementTitle !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'announcement_title' },
        update: { value: String(announcementTitle).trim() },
        create: { key: 'announcement_title', value: String(announcementTitle).trim() },
      });
    }

    if (announcementMessage !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'announcement_message' },
        update: { value: String(announcementMessage).trim() },
        create: { key: 'announcement_message', value: String(announcementMessage).trim() },
      });
    }

    if (announcementLinkText !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'announcement_link_text' },
        update: { value: String(announcementLinkText).trim() },
        create: { key: 'announcement_link_text', value: String(announcementLinkText).trim() },
      });
    }

    if (announcementLinkUrl !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'announcement_link_url' },
        update: { value: String(announcementLinkUrl).trim() },
        create: { key: 'announcement_link_url', value: String(announcementLinkUrl).trim() },
      });
    }

    // Event Date & Venue & Registration status
    if (eventDate !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'event_date' },
        update: { value: String(eventDate).trim() },
        create: { key: 'event_date', value: String(eventDate).trim() },
      });
    }

    if (eventVenue !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'event_venue' },
        update: { value: String(eventVenue).trim() },
        create: { key: 'event_venue', value: String(eventVenue).trim() },
      });
    }

    if (registrationOpen !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'registration_open' },
        update: { value: String(Boolean(registrationOpen)) },
        create: { key: 'registration_open', value: String(Boolean(registrationOpen)) },
      });
    }

    // Payment Accounts (Telebirr & Awash Bank)
    if (telebirrNumber !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'telebirr_number' },
        update: { value: String(telebirrNumber).trim() },
        create: { key: 'telebirr_number', value: String(telebirrNumber).trim() },
      });
    }

    if (telebirrName !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'telebirr_name' },
        update: { value: String(telebirrName).trim() },
        create: { key: 'telebirr_name', value: String(telebirrName).trim() },
      });
    }

    if (awashAccount !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'awash_account' },
        update: { value: String(awashAccount).trim() },
        create: { key: 'awash_account', value: String(awashAccount).trim() },
      });
    }

    if (awashName !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'awash_name' },
        update: { value: String(awashName).trim() },
        create: { key: 'awash_name', value: String(awashName).trim() },
      });
    }

    // Social Links
    if (telegramLink !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'telegram_link' },
        update: { value: String(telegramLink).trim() },
        create: { key: 'telegram_link', value: String(telegramLink).trim() },
      });
    }

    if (discordLink !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'discord_link' },
        update: { value: String(discordLink).trim() },
        create: { key: 'discord_link', value: String(discordLink).trim() },
      });
    }

    // Sponsors & Partners Configuration
    if (sponsorsEnabled !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'sponsors_enabled' },
        update: { value: String(Boolean(sponsorsEnabled)) },
        create: { key: 'sponsors_enabled', value: String(Boolean(sponsorsEnabled)) },
      });
    }

    if (sponsorsTitle !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'sponsors_title' },
        update: { value: String(sponsorsTitle).trim() },
        create: { key: 'sponsors_title', value: String(sponsorsTitle).trim() },
      });
    }

    if (sponsorsSubtitle !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'sponsors_subtitle' },
        update: { value: String(sponsorsSubtitle).trim() },
        create: { key: 'sponsors_subtitle', value: String(sponsorsSubtitle).trim() },
      });
    }

    if (sponsors !== undefined && Array.isArray(sponsors)) {
      await prisma.systemSetting.upsert({
        where: { key: 'sponsors_data' },
        update: { value: JSON.stringify(sponsors) },
        create: { key: 'sponsors_data', value: JSON.stringify(sponsors) },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminEmail: session.user.email || session.user.name || 'admin',
        action: 'UPDATE_SYSTEM_SETTINGS',
        details: JSON.stringify({ vipPrice, vipEnabled, maxCapacity, announcementEnabled, updatedGeminiKey: Boolean(geminiApiKey) }),
      },
    });

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('[ADMIN_SETTINGS_POST_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
