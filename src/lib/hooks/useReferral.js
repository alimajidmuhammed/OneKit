/**
 * Referral Program Hook
 * Manages referral code generation, tracking, and rewards
 */

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

export function useReferral(userId) {
    const [referralCode, setReferralCode] = useState(null);
    const [referralStats, setReferralStats] = useState({
        totalReferrals: 0,
        pendingRewards: 0,
        claimedRewards: 0
    });
    const [loading, setLoading] = useState(true);
    const supabase = getSupabaseClient();

    // Generate a unique referral code
    const generateReferralCode = async () => {
        if (!userId) return null;

        try {
            // Check if user already has a code
            const { data: existing, error: fetchError } = await supabase
                .from('referral_codes')
                .select('code')
                .eq('user_id', userId)
                .maybeSingle();

            if (fetchError) {
                console.error('Error fetching referral code:', fetchError);
                // If table doesn't exist or other error, return a temporary code
                return `ONEKIT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            }

            if (existing && existing.code) {
                return existing.code;
            }

            // Generate new code (format: ONEKIT-XXXXX)
            const code = `ONEKIT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

            const { data, error: insertError } = await supabase
                .from('referral_codes')
                .insert([{
                    user_id: userId,
                    code: code,
                    uses_count: 0
                }])
                .select()
                .single();

            if (insertError) {
                console.error('Error inserting referral code:', insertError);
                // Return the generated code even if insert fails (for display purposes)
                // User will still be able to share it, just won't be saved to DB yet
                return code;
            }

            return data.code;
        } catch (error) {
            console.error('Error generating referral code:', error);
            // Fallback: return a temporary code
            return `ONEKIT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        }
    };

    // Fetch referral statistics
    const fetchReferralStats = async () => {
        if (!userId) return;

        try {
            const { data: referrals, error } = await supabase
                .from('referrals')
                .select('*')
                .eq('referrer_id', userId);

            if (error) throw error;

            const stats = {
                totalReferrals: referrals?.length || 0,
                pendingRewards: referrals?.filter(r => r.reward_status === 'pending').length || 0,
                claimedRewards: referrals?.filter(r => r.reward_status === 'claimed').length || 0
            };

            setReferralStats(stats);
        } catch (error) {
            console.error('Error fetching referral stats:', error);
        }
    };

    // Apply referral code (called during signup)
    const applyReferralCode = async (code, newUserId) => {
        try {
            // Find the referral code
            const { data: referralCode, error: codeError } = await supabase
                .from('referral_codes')
                .select('user_id')
                .eq('code', code)
                .single();

            if (codeError || !referralCode) {
                return { success: false, error: 'Invalid referral code' };
            }

            // Create referral record
            const { error: referralError } = await supabase
                .from('referrals')
                .insert([{
                    referrer_id: referralCode.user_id,
                    referred_user_id: newUserId,
                    referral_code: code,
                    reward_status: 'pending'
                }]);

            if (referralError) throw referralError;

            // Increment uses count
            await supabase
                .from('referral_codes')
                .update({ uses_count: supabase.raw('uses_count + 1') })
                .eq('code', code);

            return { success: true };
        } catch (error) {
            console.error('Error applying referral code:', error);
            return { success: false, error: error.message };
        }
    };

    // Load referral code on mount
    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const loadReferral = async () => {
            setLoading(true);
            const code = await generateReferralCode();
            setReferralCode(code);
            await fetchReferralStats();
            setLoading(false);
        };

        loadReferral();
    }, [userId]);

    return {
        referralCode,
        referralStats,
        loading,
        applyReferralCode,
        refreshStats: fetchReferralStats
    };
}
