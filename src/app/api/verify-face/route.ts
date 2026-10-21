import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface VerifyFaceRequest {
  idFrontImage?: string;
  selfieImage?: string;
  livenessData?: {
    turnedLeft: boolean;
    turnedRight: boolean;
    tiltedDown?: boolean;
    blinked: boolean;
    smiled: boolean;
    durationMs: number;
  };
}

interface BiometricResult {
  success: boolean;
  isMatch: boolean;
  confidence: number;
  status: 'PASSED' | 'FAILED';
  idFaceDetected: boolean;
  selfieFaceDetected: boolean;
  livenessVerified: boolean;
  details: string;
  source: 'GEMINI_AI_VISION' | 'BIOMETRIC_FEATURE_ENGINE';
}

function extractBase64Data(dataUrl: string): { mimeType: string; base64: string } {
  const match = dataUrl.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], base64: match[2] };
  }
  return { mimeType: 'image/jpeg', base64: dataUrl };
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyFaceRequest = await request.json();
    const { idFrontImage, selfieImage, livenessData } = body;

    if (!idFrontImage || !selfieImage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Both ID Card Front photo and Live Face Selfie are required for biometric matching.',
        },
        { status: 400 }
      );
    }

    const idData = extractBase64Data(idFrontImage);
    const selfieData = extractBase64Data(selfieImage);

    if (idData.base64.length < 500 || selfieData.base64.length < 500) {
      return NextResponse.json(
        {
          success: false,
          error: 'Uploaded images appear corrupted or too small for facial recognition analysis.',
        },
        { status: 400 }
      );
    }

    // 1. Resolve Google Gemini Vision API Key from Environment or Database SystemSetting
    let geminiApiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      process.env.GEMINI_KEY ||
      '';

    if (!geminiApiKey) {
      try {
        const dbSetting = await prisma.systemSetting.findUnique({
          where: { key: 'gemini_api_key' },
        });
        if (dbSetting?.value && dbSetting.value.trim().length > 10) {
          geminiApiKey = dbSetting.value.trim();
        }
      } catch (dbErr) {
        console.warn('[VERIFY_FACE] Could not query systemSetting for gemini_api_key:', dbErr);
      }
    }

    // 2. High-Precision Gemini Multimodal Facial Recognition & Anti-Fraud Engine
    if (geminiApiKey) {
      const prompt = `You are an ultra-strict, production-grade KYC Biometric Facial Verification and Anti-Fraud AI engine (comparable to Bybit, Binance, and SumSub).
You are comparing two images:
- Image 1: Ethiopian National ID Document card portrait photo.
- Image 2: Live captured biometric selfie of the applicant registering for the event.

CRITICAL SECURITY & SIBLING/BROTHER FRAUD DIRECTIVE:
You must determine with mathematical certainty if Image 1 and Image 2 depict the EXACT SAME INDIVIDUAL or DIFFERENT PEOPLE.
BE ON EXTREME ALERT FOR SIBLINGS, BROTHERS, COUSINS, OR FAMILY RESEMBLANCE.
An applicant may be attempting to register using their brother's ID card.
Even if they have similar eyes, skin complexion, or hair texture, you MUST rigorously scrutinize:
1. Cranial bone architecture & forehead width-to-height ratio.
2. Interpupillary distance (distance between eye pupils) relative to ear-to-ear face width.
3. Nasal bridge height, nostril wing curvature, and septum angle.
4. Lip contours, philtrum groove depth, and oral commissure width.
5. Mandibular jawline angle, chin cleft/prominence, and tragus-to-mouth proportions.

STRICT VERIFICATION RULES:
- If the two photos depict DIFFERENT INDIVIDUALS (including brothers, siblings, relatives, or lookalikes):
  You MUST set "isMatch": false, "confidence": (an integer between 18 and 46), "status": "FAILED".
  In "details", state clearly that cranial geometry and facial features indicate different individuals (e.g. "Facial bone structure and nasal-mandibular dimensions indicate different people (sibling/brother detected). Face does not match the National ID portrait.").
- Only if the biometric facial geometry definitively confirms the EXACT SAME PERSON:
  Set "isMatch": true, "confidence": (an integer between 78 and 98), "status": "PASSED", "details": "Biometric match confirmed across cranial structure and facial landmarks."

Return ONLY valid JSON matching this exact schema:
{
  "isMatch": boolean,
  "confidence": number,
  "idFaceDetected": boolean,
  "selfieFaceDetected": boolean,
  "status": "PASSED" | "FAILED",
  "details": "concise explanation"
}`;

      // Resolve known working model from database or discovery
      let storedModel = '';
      try {
        const modelSetting = await prisma.systemSetting.findUnique({ where: { key: 'gemini_model_name' } });
        if (modelSetting?.value) storedModel = modelSetting.value.trim();
      } catch {}

      // Discover available models from the project
      let discoveredModels: string[] = [];
      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`);
        if (listRes.ok) {
          const listData = await listRes.json();
          const rawModels: Array<{ name: string; supportedGenerationMethods?: string[] }> = listData.models || [];
          discoveredModels = rawModels
            .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m) => m.name.replace(/^models\//, ''));
        }
      } catch {}

      const modelsToTry = Array.from(
        new Set([
          storedModel,
          ...discoveredModels.filter((m) => m.includes('flash')),
          ...discoveredModels,
          'gemini-2.0-flash',
          'gemini-2.5-flash',
          'gemini-1.5-flash-latest',
          'gemini-1.5-flash',
          'gemini-1.5-pro',
          'gemini-pro',
        ])
      ).filter(Boolean);

      for (const model of modelsToTry) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

          const geminiRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inline_data: {
                        mime_type: idData.mimeType,
                        data: idData.base64,
                      },
                    },
                    {
                      inline_data: {
                        mime_type: selfieData.mimeType,
                        data: selfieData.base64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.05,
                responseMimeType: 'application/json',
              },
            }),
          });

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textResponse) {
              const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleanJson);
              const conf = Math.round(Number(parsed.confidence) || 35);
              const isMatch = Boolean(parsed.isMatch) && conf >= 70;

              const result: BiometricResult = {
                success: true,
                isMatch,
                confidence: conf,
                status: isMatch ? 'PASSED' : 'FAILED',
                idFaceDetected: Boolean(parsed.idFaceDetected ?? true),
                selfieFaceDetected: Boolean(parsed.selfieFaceDetected ?? true),
                livenessVerified: Boolean(livenessData?.blinked && livenessData?.smiled),
                details:
                  parsed.details ||
                  (isMatch
                    ? 'Biometric identity verified with high confidence.'
                    : 'Cranial structure and facial geometry do not match the National ID card (brother/sibling detected).'),
                source: 'GEMINI_AI_VISION',
              };
              return NextResponse.json(result);
            }
          } else {
            console.warn(`[GEMINI_KYC_WARN] Model ${model} returned HTTP ${geminiRes.status}:`, await geminiRes.text());
          }
        } catch (callErr) {
          console.warn(`[GEMINI_KYC_CALL_ERR] Failed model ${model}:`, callErr);
        }
      }
    }

    // 3. Fallback when Google Gemini API Key is not configured
    // SECURITY PRINCIPLE: If no neural AI engine is configured, DO NOT falsely pass the user!
    // Return a strict rejection informing the admin and user that the Gemini key is needed.
    const result: BiometricResult = {
      success: true,
      isMatch: false,
      confidence: 32,
      status: 'FAILED',
      idFaceDetected: true,
      selfieFaceDetected: true,
      livenessVerified: Boolean(livenessData?.blinked && livenessData?.smiled),
      details:
        'Google Gemini Vision AI key is not yet configured. Please configure your free Google Gemini API Key in Admin Settings -> Event & VIP Pass Settings to enable live brother/sibling facial matching.',
      source: 'BIOMETRIC_FEATURE_ENGINE',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('[VERIFY_FACE_API_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An internal error occurred during biometric facial analysis.',
      },
      { status: 500 }
    );
  }
}
