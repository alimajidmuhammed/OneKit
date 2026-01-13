'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export function useCV() {
    const [cvs, setCvs] = useState([]);
    const [currentCV, setCurrentCV] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { user } = useAuth();
    const supabase = getSupabaseClient();

    // Fetch user's CVs
    const fetchCVs = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('cv_documents')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setCvs(data || []);
        } catch (err) {
            console.error('Error fetching CVs:', err);
        } finally {
            setLoading(false);
        }
    }, [user, supabase]);

    // Fetch single CV
    const fetchCV = useCallback(async (id) => {
        try {
            const { data, error } = await supabase
                .from('cv_documents')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setCurrentCV(data);
            return data;
        } catch (err) {
            console.error('Error fetching CV:', err);
            return null;
        }
    }, [supabase]);

    // Create new CV
    const createCV = useCallback(async (name, templateId = 'professional') => {
        if (!user) return { error: 'Not authenticated' };

        setSaving(true);
        try {
            const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

            const { data, error } = await supabase
                .from('cv_documents')
                .insert({
                    user_id: user.id,
                    name,
                    template_id: templateId,
                    slug,
                    personal_info: {},
                    experience: [],
                    education: [],
                    skills: [],
                    languages: [],
                    certifications: [],
                    projects: [],
                })
                .select()
                .single();

            if (error) throw error;
            await fetchCVs();
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [user, supabase, fetchCVs]);

    // Update CV
    const updateCV = useCallback(async (id, updates) => {
        setSaving(true);
        try {
            const { data, error } = await supabase
                .from('cv_documents')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setCurrentCV(data);
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [supabase]);

    // Delete CV and clean up R2 images
    const deleteCV = useCallback(async (id) => {
        try {
            // First fetch the CV to get the photo URL
            const { data: cvData, error: fetchError } = await supabase
                .from('cv_documents')
                .select('personal_info')
                .eq('id', id)
                .single();

            // Delete photo from R2 if it exists
            if (cvData?.personal_info?.photo) {
                const photoUrl = cvData.personal_info.photo;
                // Only delete if it's an R2 URL (not a blob URL or Supabase URL)
                if (photoUrl.includes('r2.dev')) {
                    try {
                        await fetch('/api/upload/delete', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: photoUrl }),
                        });
                    } catch (e) {
                        console.error('Failed to delete R2 image:', e);
                    }
                }
            }

            // Now delete the CV record
            const { error } = await supabase
                .from('cv_documents')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchCVs();
            return { error: null };
        } catch (err) {
            return { error: err.message };
        }
    }, [supabase, fetchCVs]);


    // Duplicate CV
    const duplicateCV = useCallback(async (id) => {
        const cv = cvs.find(c => c.id === id);
        if (!cv) return { error: 'CV not found' };

        return createCV(`${cv.name} (Copy)`, cv.template_id);
    }, [cvs, createCV]);

    useEffect(() => {
        fetchCVs();
    }, [fetchCVs]);

    return {
        cvs,
        currentCV,
        loading,
        saving,
        fetchCVs,
        fetchCV,
        createCV,
        updateCV,
        deleteCV,
        duplicateCV,
        setCurrentCV,
    };
}

export default useCV;
