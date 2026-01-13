/**
 * API Request Logger Middleware
 * Logs all API requests for monitoring and security analysis
 */

import { getSupabaseClient } from '@/lib/supabase/client';

/**
 * Log levels
 */
export const LOG_LEVELS = {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    SECURITY: 'security',
};

/**
 * Log an API request
 * @param {Object} options - Logging options
 */
export async function logApiRequest({
    endpoint,
    method,
    userId = null,
    ip = null,
    userAgent = null,
    statusCode,
    responseTime,
    level = LOG_LEVELS.INFO,
    metadata = {},
}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        endpoint,
        method,
        user_id: userId,
        ip_address: ip,
        user_agent: userAgent,
        status_code: statusCode,
        response_time_ms: responseTime,
        level,
        metadata: JSON.stringify(metadata),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`[API] ${method} ${endpoint} - ${statusCode} (${responseTime}ms)`,
            level !== LOG_LEVELS.INFO ? `[${level.toUpperCase()}]` : '');
    }

    // In production, log to database
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_API_LOGGING === 'true') {
        try {
            const supabase = getSupabaseClient();
            await supabase.from('api_logs').insert([logEntry]);
        } catch (error) {
            console.error('Failed to log API request:', error);
        }
    }

    return logEntry;
}

/**
 * Log security events (failed auth, rate limits, suspicious activity)
 */
export async function logSecurityEvent({
    event,
    userId = null,
    ip = null,
    details = {},
}) {
    const securityEntry = {
        timestamp: new Date().toISOString(),
        event,
        user_id: userId,
        ip_address: ip,
        details: JSON.stringify(details),
    };

    console.warn(`[SECURITY] ${event}`, details);

    // Always log security events to database in production
    if (process.env.NODE_ENV === 'production') {
        try {
            const supabase = getSupabaseClient();
            await supabase.from('security_logs').insert([securityEntry]);
        } catch (error) {
            console.error('Failed to log security event:', error);
        }
    }

    return securityEntry;
}

/**
 * Wrapper to add logging to API handlers
 * @param {Function} handler - The API route handler
 * @param {string} endpoint - Endpoint name for logging
 */
export function withApiLogging(handler, endpoint) {
    return async (request, context) => {
        const startTime = Date.now();
        const method = request.method;
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        try {
            const response = await handler(request, context);
            const responseTime = Date.now() - startTime;

            await logApiRequest({
                endpoint,
                method,
                ip,
                userAgent,
                statusCode: response.status,
                responseTime,
                level: response.status >= 400 ? LOG_LEVELS.WARN : LOG_LEVELS.INFO,
            });

            return response;
        } catch (error) {
            const responseTime = Date.now() - startTime;

            await logApiRequest({
                endpoint,
                method,
                ip,
                userAgent,
                statusCode: 500,
                responseTime,
                level: LOG_LEVELS.ERROR,
                metadata: { error: error.message },
            });

            throw error;
        }
    };
}
