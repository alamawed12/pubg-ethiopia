/**
 * In-memory sliding-window rate limiter for Next.js.
 * Tracks timestamps per identifier (IP address, phone number, user ID, etc.).
 *
 * Default: 5 requests per 15 minutes (15 * 60 * 1000 ms).
 */

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number; // Unix timestamp in ms when the oldest rate-limited request expires
  limit: number;
}

// Global state map to survive hot-module reloading in development
const globalRateLimitStore = globalThis as unknown as {
  __rateLimitMap?: Map<string, number[]>;
};

const store: Map<string, number[]> =
  globalRateLimitStore.__rateLimitMap ?? new Map<string, number[]>();

if (process.env.NODE_ENV !== 'production') {
  globalRateLimitStore.__rateLimitMap = store;
}

const DEFAULT_LIMIT = 5;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Checks and updates rate limits for a given identifier using a sliding window algorithm.
 *
 * @param identifier Unique client key (e.g. IP address, UID, or session ID)
 * @param limit Maximum allowed hits within the window (default: 5)
 * @param windowMs Time window in milliseconds (default: 15 minutes)
 * @returns RateLimitResult with success, remaining count, and reset timestamp
 */
export function rateLimit(
  identifier: string,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Retrieve existing timestamps for identifier
  const existingTimestamps = store.get(identifier) ?? [];

  // Evict timestamps older than current sliding window
  const validTimestamps = existingTimestamps.filter((ts) => ts > windowStart);

  if (validTimestamps.length >= limit) {
    const oldestTimestamp = validTimestamps[0] ?? now;
    const resetTime = oldestTimestamp + windowMs;

    // Update store with pruned timestamps
    store.set(identifier, validTimestamps);

    return {
      success: false,
      remaining: 0,
      resetTime,
      limit,
    };
  }

  // Record this attempt
  validTimestamps.push(now);
  store.set(identifier, validTimestamps);

  const oldestTimestamp = validTimestamps[0] ?? now;
  const resetTime = oldestTimestamp + windowMs;

  // Opportunistic cleanup of stale entries if the store grows large
  if (store.size > 10000) {
    cleanupStaleEntries(now, windowMs);
  }

  return {
    success: true,
    remaining: Math.max(0, limit - validTimestamps.length),
    resetTime,
    limit,
  };
}

/**
 * Evicts expired identifiers from memory to prevent memory leaks.
 */
function cleanupStaleEntries(now: number, windowMs: number): void {
  const threshold = now - windowMs;
  for (const [key, timestamps] of store.entries()) {
    const fresh = timestamps.filter((t) => t > threshold);
    if (fresh.length === 0) {
      store.delete(key);
    } else {
      store.set(key, fresh);
    }
  }
}

/**
 * Resets rate limit for a specific identifier (e.g., after successful OTP or manual admin unlock).
 */
export function resetRateLimit(identifier: string): void {
  store.delete(identifier);
}

/**
 * Clears all active rate limit records (useful for testing or server restart).
 */
export function clearAllRateLimits(): void {
  store.clear();
}

export default rateLimit;
