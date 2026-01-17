// @ts-nocheck
/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter for API protection
 * For production, consider using Redis-based solutions like @upstash/ratelimit
 */

// In-memory store (resets on server restart)
const rateLimitStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
        if (now - data.firstRequest > 60000) { // Older than 1 minute
            rateLimitStore.delete(key);
        }
    }
}, 300000);

/**
 * Check if a request should be rate limited
 * @param {string} identifier - Unique identifier (user ID, IP, etc.)
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{ success: boolean, remaining: number, reset: number }}
 */
export function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const key = identifier;

    let data = rateLimitStore.get(key);

    if (!data || now - data.firstRequest > windowMs) {
        // New window
        data = {
            count: 1,
            firstRequest: now,
        };
        rateLimitStore.set(key, data);
        return {
            success: true,
            remaining: maxRequests - 1,
            reset: now + windowMs,
        };
    }

    if (data.count >= maxRequests) {
        // Rate limited
        return {
            success: false,
            remaining: 0,
            reset: data.firstRequest + windowMs,
        };
    }

    // Increment counter
    data.count++;
    rateLimitStore.set(key, data);

    return {
        success: true,
        remaining: maxRequests - data.count,
        reset: data.firstRequest + windowMs,
    };
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
    AI_ENDPOINTS: { maxRequests: 10, windowMs: 60000 },      // 10 per minute
    UPLOAD: { maxRequests: 20, windowMs: 60000 },            // 20 per minute
    PAYMENTS: { maxRequests: 5, windowMs: 60000 },           // 5 per minute
    AUTH: { maxRequests: 5, windowMs: 300000 },              // 5 per 5 minutes
    DEFAULT: { maxRequests: 100, windowMs: 60000 },          // 100 per minute
};

/**
 * Get rate limit response headers
 */
export function getRateLimitHeaders(result) {
    return {
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
    };
}
