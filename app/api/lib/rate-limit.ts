import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory rate limiter for development/self-hosted
 * For production Vercel deployment, use Upstash Redis
 */
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Cleanup expired entries every minute
    setInterval(() => {
      const now = Date.now();
      Object.keys(this.store).forEach((key) => {
        if (this.store[key].resetTime < now) {
          delete this.store[key];
        }
      });
    }, 60000);
  }

  isLimited(key: string): boolean {
    const now = Date.now();
    const entry = this.store[key];

    if (!entry || entry.resetTime < now) {
      // New window
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      return false;
    }

    if (entry.count < this.maxRequests) {
      entry.count++;
      return false;
    }

    return true;
  }

  getRetryAfter(key: string): number {
    const entry = this.store[key];
    if (!entry) return 0;
    return Math.ceil((entry.resetTime - Date.now()) / 1000);
  }
}

// Global rate limiters
const apiLimiter = new RateLimiter(60000, 100); // 100 requests per minute
const authLimiter = new RateLimiter(900000, 7); // 7 requests per 15 minutes (auth endpoints)
const uploadLimiter = new RateLimiter(3600000, 15); // 15 requests per hour (upload endpoints)

/**
 * Extract client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const clientIp = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
  return clientIp.trim();
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: {
    windowMs?: number;
    maxRequests?: number;
    limiterType?: 'api' | 'auth' | 'upload';
  }
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const clientIp = getClientIp(request);
    const limiterType = options?.limiterType || 'api';

    let limiter: RateLimiter;
    switch (limiterType) {
      case 'auth':
        limiter = authLimiter;
        break;
      case 'upload':
        limiter = uploadLimiter;
        break;
      default:
        limiter = apiLimiter;
    }

    if (limiter.isLimited(clientIp)) {
      const retryAfter = limiter.getRetryAfter(clientIp);
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': limiter['maxRequests']?.toString() || '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(
              Date.now() + retryAfter * 1000
            ).toISOString(),
          },
        }
      );
    }

    return handler(request);
  };
}

/**
 * Per-user rate limiting (for authenticated endpoints)
 */
export function withUserRateLimit(
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>,
  options?: {
    windowMs?: number;
    maxRequests?: number;
  }
) {
  const limiter = new RateLimiter(
    options?.windowMs || 60000,
    options?.maxRequests || 100
  );

  return async (
    request: NextRequest,
    userId: string
  ): Promise<NextResponse> => {
    if (limiter.isLimited(userId)) {
      const retryAfter = limiter.getRetryAfter(userId);
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }

    return handler(request, userId);
  };
}
