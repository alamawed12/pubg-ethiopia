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

    const [
      priceSetting,
      enabledSetting,
      capacitySetting,
      heroDisplaySetting,
      geminiKeySetting,
      vipCount,
      standardCount,
      totalRegistrations,
    ] = await Promise.all([
      prisma.systemSetting.findUnique({ where: { key: 'vip_ticket_price' } }),
      prisma.systemSetting.findUnique({ where: { key: 'vip_ticket_enabled' } }),
      prisma.systemSetting.findUnique({ where: { key: 'max_capacity' } }),
      prisma.systemSetting.findUnique({ where: { key: 'hero_attendees_display' } }),
      prisma.systemSetting.findUnique({ where: { key: 'gemini_api_key' } }),
      prisma.registration.count({ where: { ticketTier: 'VIP' } }),
      prisma.registration.count({ where: { ticketTier: 'STANDARD' } }),
      prisma.registration.count(),
    ]);

    const vipPrice = priceSetting ? parseInt(priceSetting.value, 10) : 500;
    const vipEnabled = enabledSetting ? enabledSetting.value === 'true' : true;
    const maxCapacity = capacitySetting ? parseInt(capacitySetting.value, 10) : 300;
    const heroAttendeesDisplay = heroDisplaySetting?.value || (capacitySetting ? `${capacitySetting.value}+` : '300+');

    const rawKey = geminiKeySetting?.value || process.env.GEMINI_API_KEY || '';
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
    const { action, vipPrice, vipEnabled, maxCapacity, heroAttendeesDisplay, geminiApiKey } = body;

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

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminEmail: session.user.email || session.user.name || 'admin',
        action: 'UPDATE_SYSTEM_SETTINGS',
        details: JSON.stringify({ vipPrice, vipEnabled, maxCapacity, updatedGeminiKey: Boolean(geminiApiKey) }),
      },
    });

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('[ADMIN_SETTINGS_POST_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
