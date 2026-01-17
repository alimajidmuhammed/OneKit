// @ts-nocheck
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { SERVICES, APP_CONFIG } from '@/lib/utils/constants';

// Get supabase client once at module level
const supabase = getSupabaseClient();

export function useSubscription(serviceSlug = null) {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, profile } = useAuth();

    // Memoize trial calculations based on profile.created_at
    const trialInfo = useMemo(() => {
        if (!profile?.created_at) {
            return { isInTrial: false, daysRemaining: 0, hoursRemaining: 0 };
        }

        const createdAt = new Date(profile.created_at);
        const now = new Date();
        const trialDays = APP_CONFIG.trial?.days ?? 2;
        const trialEndDate = new Date(createdAt.getTime() + (trialDays * 24 * 60 * 60 * 1000));
        const remaining = trialEndDate - now;

        return {
            isInTrial: now < trialEndDate,
            daysRemaining: Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24))),
            hoursRemaining: Math.max(0, Math.ceil(remaining / (1000 * 60 * 60))),
        };
    }, [profile?.created_at]);

    // Fetch subscriptions only when user changes
    const fetchSubscriptions = useCallback(async () => {
        if (!user) {
            setSubscriptions([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('subscriptions')
                .select(`*, service:services(*)`)
                .eq('user_id', user.id);

            if (serviceSlug) {
                query = query.eq('services.slug', serviceSlug);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setSubscriptions(data || []);
        } catch (err) {
            console.error('Error fetching subscriptions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.id, serviceSlug]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    // Memoize service lookup
    const isServiceFree = useCallback((slug) => {
        const service = SERVICES.find(s => s.slug === slug);
        return service?.isFree === true;
    }, []);

    const hasActiveSubscription = useCallback((slug) => {
        return subscriptions.some(
            (sub) =>
                sub.service?.slug === slug &&
                sub.status === 'active' &&
                (!sub.expires_at || new Date(sub.expires_at) > new Date())
        );
    }, [subscriptions]);

    // Main access check - memoized
    const hasAccess = useCallback((slug) => {
        if (isServiceFree(slug)) return true;
        if (hasActiveSubscription(slug)) return true;
        if (trialInfo.isInTrial) return true;
        return false;
    }, [isServiceFree, hasActiveSubscription, trialInfo.isInTrial]);

    const getSubscription = useCallback((slug) => {
        return subscriptions.find((sub) => sub.service?.slug === slug);
    }, [subscriptions]);

    const getSubscriptionStatus = useCallback((slug) => {
        const sub = getSubscription(slug);
        if (!sub) return 'none';

        if (sub.status === 'active') {
            if (sub.expires_at && new Date(sub.expires_at) <= new Date()) {
                return 'expired';
            }
            return 'active';
        }

        return sub.status;
    }, [getSubscription]);

    // Get access status with detailed info - memoized
    const getAccessStatus = useCallback((slug) => {
        if (isServiceFree(slug)) {
            return { hasAccess: true, type: 'free', message: 'Free forever' };
        }

        if (hasActiveSubscription(slug)) {
            return { hasAccess: true, type: 'subscription', message: 'Active subscription' };
        }

        if (trialInfo.isInTrial) {
            const { daysRemaining, hoursRemaining } = trialInfo;
            return {
                hasAccess: true,
                type: 'trial',
                daysRemaining,
                hoursRemaining,
                message: daysRemaining > 0 ? `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left in trial` : `${hoursRemaining} hours left in trial`
            };
        }

        return { hasAccess: false, type: 'expired', message: 'Trial expired - Subscribe to continue' };
    }, [isServiceFree, hasActiveSubscription, trialInfo]);

    return {
        subscriptions,
        loading,
        error,
        hasActiveSubscription,
        hasAccess,
        isServiceFree,
        isInTrialPeriod: trialInfo.isInTrial,
        trialDaysRemaining: trialInfo.daysRemaining,
        trialHoursRemaining: trialInfo.hoursRemaining,
        getSubscription,
        getSubscriptionStatus,
        getAccessStatus,
        refetch: fetchSubscriptions,
    };
}

export default useSubscription;
