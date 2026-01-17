// @ts-nocheck
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export function useInvoice() {
    const [invoices, setInvoices] = useState([]);
    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { user } = useAuth();
    const supabase = getSupabaseClient();

    // Fetch user's invoices
    const fetchInvoices = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (error) {
                if (error.code === '42P01') { // Table doesn't exist
                    console.warn('Invoices table not found. Please create it in Supabase.');
                    setInvoices([]);
                } else {
                    throw error;
                }
            } else {
                setInvoices(data || []);
            }
        } catch (err) {
            console.error('Error fetching invoices (Detailed):', {
                message: err.message,
                details: err.details,
                hint: err.hint,
                code: err.code,
                error: err
            });
        } finally {
            setLoading(false);
        }
    }, [user, supabase]);

    // Fetch single invoice
    const fetchInvoice = useCallback(async (id) => {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setCurrentInvoice(data);
            return data;
        } catch (err) {
            console.error('Error fetching invoice (Detailed):', JSON.stringify({
                message: err.message,
                details: err.details,
                hint: err.hint,
                code: err.code,
                error: err
            }, null, 2));
            return null;
        }
    }, [supabase]);

    // Create new invoice
    const createInvoice = useCallback(async (name, templateId = 'classic') => {
        if (!user) return { error: 'Not authenticated' };

        setSaving(true);
        try {
            const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

            const { data, error } = await supabase
                .from('invoices')
                .insert({
                    user_id: user.id,
                    name,
                    template_id: templateId,
                    slug,
                    invoice_data: {
                        page_size: 'A4',
                        orientation: 'portrait',
                        primary_color: '#1e3a8a',
                        logo_url: null,
                        receipt_no: '',
                        date: new Date().toISOString().split('T')[0],
                        received_from: '',
                        sum_of: '',
                        amount_usd: '',
                        amount_iqd: '',
                        details: '',
                        currency: 'IQD',
                        social_links: {
                            facebook: '',
                            instagram: '',
                            snapchat: '',
                            tiktok: ''
                        },
                        contact_info: {
                            phone: '',
                            email: '',
                            address: ''
                        },
                        signatures: {
                            buyer: '',
                            accountant: ''
                        },
                        labels: {
                            header_visa: '✈️ Service Title 1',
                            header_edu: '🎓 Service Title 2',
                            header_law: '⚖️ Service Title 3',
                            company_name_en: 'Company Name',
                            company_name_ku: 'ناوی کۆمپانیا',
                            company_prefix_ku: 'کۆمپانیای',
                            label_no_en: 'No.',
                            label_no_ku: ':ژمارە',
                            label_date_en: 'Date',
                            label_date_ku: ':بەروار',
                            label_usd_ku: 'USD دۆلار',
                            label_iqd_ku: 'IQD دینار',
                            label_received_en: 'Received from',
                            label_received_ku: ':وەرگیرا لە',
                            label_sum_en: 'Sum of',
                            label_sum_ku: ':بـڕی',
                            label_details_en: 'Details',
                            label_details_ku: ':تێبینی',
                            label_buyer_ku: 'Buyer / کریار',
                            label_accountant_ku: 'Accountant / ژمێریار'
                        }
                    },
                })
                .select()
                .single();

            if (error) throw error;
            await fetchInvoices();
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [user, supabase, fetchInvoices]);

    // Update invoice
    const updateInvoice = useCallback(async (id, updates) => {
        setSaving(true);
        try {
            const { data, error } = await supabase
                .from('invoices')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setCurrentInvoice(data);
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [supabase]);

    // Delete invoice
    const deleteInvoice = useCallback(async (id) => {
        try {
            const { error } = await supabase
                .from('invoices')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchInvoices();
            return { error: null };
        } catch (err) {
            return { error: err.message };
        }
    }, [supabase, fetchInvoices]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    return {
        invoices,
        currentInvoice,
        loading,
        saving,
        fetchInvoices,
        fetchInvoice,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        setCurrentInvoice,
    };
}

export default useInvoice;
