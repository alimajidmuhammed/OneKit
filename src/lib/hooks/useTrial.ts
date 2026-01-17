'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export function useTrial(serviceSlug) {
    const [trial, setTrial] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const supabase = getSupabaseClient();

    // Check trial status
    const checkTrial = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('user_trials')
                .select('*')
                .eq('user_id', user.id)
                .eq('service_slug', serviceSlug)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            setTrial(data);
        } catch (err) {
            console.error('Error checking trial:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkTrial();
    }, [user, serviceSlug]);

    // Calculate trial status
    const isTrialActive = () => {
        if (!trial) return false;
        if (!trial.is_active) return false;
        return new Date(trial.expires_at) > new Date();
    };

    const getTrialDaysRemaining = () => {
        if (!trial) return 0;
        const now = new Date();
        const expiry = new Date(trial.expires_at);
        const diff = expiry - now;
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const getTrialHoursRemaining = () => {
        if (!trial) return 0;
        const now = new Date();
        const expiry = new Date(trial.expires_at);
        const diff = expiry - now;
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
    };

    const isTrialExpired = () => {
        if (!trial) return true;
        return new Date(trial.expires_at) <= new Date();
    };

    return {
        trial,
        loading,
        isTrialActive: isTrialActive(),
        isTrialExpired: isTrialExpired(),
        daysRemaining: getTrialDaysRemaining(),
        hoursRemaining: getTrialHoursRemaining(),
        refetch: checkTrial,
    };
}

export default useTrial;
