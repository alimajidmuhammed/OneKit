// @ts-nocheck
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export function useQRCode() {
    const [qrCodes, setQRCodes] = useState([]);
    const [currentQR, setCurrentQR] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { user } = useAuth();
    const supabase = getSupabaseClient();

    // Fetch user's QR codes
    const fetchQRCodes = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('qr_codes')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQRCodes(data || []);
        } catch (err) {
            console.error('Error fetching QR codes:', err);
        } finally {
            setLoading(false);
        }
    }, [user, supabase]);

    // Create new QR code
    const createQRCode = async (name, templateId = 'modern') => {
        if (!user) return { error: 'Not authenticated' };

        setSaving(true);
        try {
            const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

            const { data, error } = await supabase
                .from('qr_codes')
                .insert({
                    user_id: user.id,
                    name,
                    template_id: templateId,
                    slug,
                    social_links: {},
                    is_active: true,
                })
                .select()
                .single();

            if (error) throw error;
            await fetchQRCodes();
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    // Update QR code
    const updateQRCode = async (id, updates) => {
        setSaving(true);
        try {
            const { data, error } = await supabase
                .from('qr_codes')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setCurrentQR(data);
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    // Delete QR code
    const deleteQRCode = async (id) => {
        try {
            const { error } = await supabase
                .from('qr_codes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchQRCodes();
            return { error: null };
        } catch (err) {
            return { error: err.message };
        }
    };

    // Fetch single QR code
    const fetchQRCode = async (id) => {
        try {
            const { data, error } = await supabase
                .from('qr_codes')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setCurrentQR(data);
            return data;
        } catch (err) {
            console.error('Error fetching QR code:', err);
            return null;
        }
    };

    useEffect(() => {
        fetchQRCodes();
    }, [fetchQRCodes]);

    return {
        qrCodes,
        currentQR,
        loading,
        saving,
        fetchQRCodes,
        fetchQRCode,
        createQRCode,
        updateQRCode,
        deleteQRCode,
        setCurrentQR,
    };
}

export default useQRCode;
