import QRCode from 'qrcode';

export interface QRGenerationOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generates a Data URL (PNG base64) QR code using the cyberpunk/military design theme.
 * Defaults:
 * - dark: #CCFF00 (radioactive lime)
 * - light: #00000000 (transparent)
 * - margin: 2
 * - width: 200
 *
 * @param data The payload or token to encode in the QR code
 * @param options Optional configuration overrides
 * @returns Promise resolving to a base64 Data URL string
 */
export async function generateQRDataURL(
  data: string,
  options?: QRGenerationOptions
): Promise<string> {
  if (!data) {
    throw new Error('Data is required to generate a QR code');
  }

  const qrOptions: QRCode.QRCodeToDataURLOptions = {
    width: options?.width ?? 300,
    margin: options?.margin ?? 3,
    errorCorrectionLevel: options?.errorCorrectionLevel ?? 'M',
    color: {
      dark: options?.darkColor ?? '#000000', // high contrast solid black modules
      light: options?.lightColor ?? '#FFFFFF', // solid white background for optical detection
    },
  };

  try {
    return await QRCode.toDataURL(data, qrOptions);
  } catch (error) {
    console.error('[QR_GENERATION_FAILED]', error);
    throw new Error(
      `Failed to generate QR code: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generates an SVG string QR code using the theme colors.
 * Useful for scalable vectors and printable attendee passes.
 */
export async function generateQRSVG(
  data: string,
  options?: QRGenerationOptions
): Promise<string> {
  if (!data) {
    throw new Error('Data is required to generate a QR SVG');
  }

  const qrOptions: QRCode.QRCodeToStringOptions = {
    type: 'svg',
    width: options?.width ?? 200,
    margin: options?.margin ?? 2,
    errorCorrectionLevel: options?.errorCorrectionLevel ?? 'M',
    color: {
      dark: options?.darkColor ?? '#CCFF00',
      light: options?.lightColor ?? '#00000000',
    },
  };

  try {
    return await QRCode.toString(data, qrOptions);
  } catch (error) {
    console.error('[QR_SVG_GENERATION_FAILED]', error);
    throw new Error(
      `Failed to generate QR SVG: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export default generateQRDataURL;
