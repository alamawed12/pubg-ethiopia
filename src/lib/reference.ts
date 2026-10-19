import { nanoid, customAlphabet } from 'nanoid';

/**
 * Characters used for registration reference IDs.
 * Uppercase alphanumeric (0-9, A-Z).
 */
const REFERENCE_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const generateRandomSuffix = customAlphabet(REFERENCE_CHARSET, 6);

/**
 * Generates a human-readable attendee reference ID.
 * Format: 'PUBG-ET-XXXX' where XXXX is 6 random uppercase alphanumeric characters.
 * Example: 'PUBG-ET-8K4F2N'
 */
export function generateReferenceId(): string {
  return `PUBG-ET-${generateRandomSuffix()}`;
}

/**
 * Generates a secure, URL-safe 32-character token for the attendee's QR check-in pass.
 * Powered by nanoid.
 */
export function generateQRToken(): string {
  return nanoid(32);
}

/**
 * Validates whether a string matches the PUBG Ethiopia reference ID pattern.
 * Expected format: PUBG-ET-XXXXXX (case-insensitive check)
 */
export function isValidReferenceId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^PUBG-ET-[A-Z0-9]{6}$/i.test(id.trim());
}

/**
 * Validates whether a string conforms to the QR token format.
 */
export function isValidQRToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  return /^[A-Za-z0-9_-]{32}$/.test(token.trim());
}

/**
 * Normalizes a reference ID to standard uppercase.
 */
export function formatReferenceId(raw: string): string {
  return raw.trim().toUpperCase();
}
