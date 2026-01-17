'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export function useBusinessCard() {
    const { user } = useAuth();
    const supabase = getSupabaseClient();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchCards = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('business_cards')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (error) {
                if (error.code === '42P01') {
                    console.warn('Business cards table not found in Supabase. Falling back to empty list.');
                    setCards([]);
                } else {
                    throw error;
                }
            } else {
                setCards(data || []);
            }
        } catch (error) {
            console.error('Error fetching cards (Detailed):', error);
            if (error) {
                console.error('Error Details:', {
                    message: error.message || 'No message',
                    details: error.details || 'No details',
                    hint: error.hint || 'No hint',
                    code: error.code || 'No code',
                    stack: error.stack
                });
            } else {
                console.error('Error object was null or undefined in catch block');
            }
        } finally {
            setLoading(false);
        }
    }, [user, supabase]);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    const fetchCard = useCallback(async (id) => {
        try {
            const { data, error } = await supabase
                .from('business_cards')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching card (Detailed):', error);
            if (error) {
                console.error('Error Details:', {
                    message: error.message || 'No message',
                    details: error.details || 'No details',
                    hint: error.hint || 'No hint',
                    code: error.code || 'No code',
                    stack: error.stack
                });
            }
            return null;
        }
    }, [supabase]);

    const createCard = useCallback(async (name, templateId = 'modern') => {
        if (!user) return { error: 'Not authenticated' };

        try {
            setSaving(true);
            const { data, error } = await supabase
                .from('business_cards')
                .insert([
                    {
                        user_id: user.id,
                        name,
                        template_id: templateId,
                        content: {},
                        updated_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            setCards([data, ...cards]);
            return { data, error: null };
        } catch (error) {
            console.error('Error creating card (Detailed):', error);
            if (error) {
                console.error('Error Details:', {
                    message: error.message || 'No message',
                    details: error.details || 'No details',
                    hint: error.hint || 'No hint',
                    code: error.code || 'No code',
                    stack: error.stack
                });
            }
            return { data: null, error };
        } finally {
            setSaving(false);
        }
    }, [user, supabase, cards]);

    const updateCard = useCallback(async (id, updates) => {
        try {
            setSaving(true);
            const { data, error } = await supabase
                .from('business_cards')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setCards(cards.map(c => c.id === id ? data : c));
            return { data, error: null };
        } catch (error) {
            console.error('Error updating card:', error);
            return { data: null, error };
        } finally {
            setSaving(false);
        }
    }, [supabase, cards]);

    const deleteCard = useCallback(async (id) => {
        try {
            const { error } = await supabase
                .from('business_cards')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setCards(cards.filter(c => c.id !== id));
            return { error: null };
        } catch (error) {
            console.error('Error deleting card:', error);
            return { error };
        }
    }, [supabase, cards]);

    return {
        cards,
        loading,
        saving,
        createCard,
        updateCard,
        deleteCard,
        fetchCard,
        refresh: fetchCards
    };
}
