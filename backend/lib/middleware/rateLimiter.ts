/**
 * Rate Limiter - PSW Voice Documentation System
 *
 * Protects API routes from abuse and DDoS attacks
 * Uses next-rate-limit for Next.js 16 compatibility
 */

import rateLimit from 'next-rate-limit';
import { NextRequest, NextResponse } from 'next/server';

// Standard API rate limiter: 100 requests per minute
export const apiLimiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 unique IPs per interval
});

// Strict limiter for authentication: 5 attempts per 15 minutes
export const authLimiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500,
});

// Voice processing limiter: 20 requests per minute (AI is expensive)
export const voiceLimiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
});

/**
 * Apply rate limiting to API route
 *
 * @param request Next.js request object
 * @param limiter Rate limiter instance
 * @param limit Max requests allowed
 * @returns null if allowed, NextResponse if rate limited
 */
export async function applyRateLimit(
  request: NextRequest,
  limiter: ReturnType<typeof rateLimit>,
  limit: number
): Promise<NextResponse | null> {
  // Get client IP (supports proxies)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // Check rate limit using next-rate-limit's checkNext method
  const rateLimitHeaders = await limiter.checkNext(request, limit);

  // If rate limit exceeded, checkNext returns headers with X-RateLimit-Remaining: 0
  const remaining = rateLimitHeaders.get('X-RateLimit-Remaining');
  if (remaining === '0') {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: 60, // seconds
      },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  return null; // Allow request
}

/**
 * Middleware wrapper for rate limiting
 *
 * Usage in API route:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await withRateLimit(request, apiLimiter, 100);
 *   if (rateLimitResult) return rateLimitResult;
 *
 *   // Your API logic here
 * }
 * ```
 */
export async function withRateLimit(
  request: NextRequest,
  limiter: ReturnType<typeof rateLimit>,
  limit: number
): Promise<NextResponse | null> {
  return applyRateLimit(request, limiter, limit);
}

// Export configured limiters with limits
export const rateLimiters = {
  api: { limiter: apiLimiter, limit: 100 }, // 100 req/min
  auth: { limiter: authLimiter, limit: 5 }, // 5 req/15min
  voice: { limiter: voiceLimiter, limit: 20 }, // 20 req/min
};
