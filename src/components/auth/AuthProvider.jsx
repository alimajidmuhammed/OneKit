'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

// Get supabase client once at module level
const supabase = getSupabaseClient();

const AuthContext = createContext({
    user: null,
    profile: null,
    loading: true,
    signIn: async () => { },
    signUp: async () => { },
    signOut: async () => { },
    resetPassword: async () => { },
    updateProfile: async () => { },
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                // Only warn for non-empty errors
                if (error.message) {
                    console.warn('Profile fetch issue:', error.message);
                }
                return;
            }

            setProfile(data);
        } catch (error) {
            if (error?.name === 'AbortError') return;
            // Silently handle - likely RLS or network issue
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        // Get initial session
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!isMounted) return;

                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
            } catch (error) {
                // Silence abort errors during navigation
                if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
                    return;
                }
                console.warn('Session fetch issue:', error?.message || error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;

                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }

                if (isMounted) {
                    setLoading(false);
                }
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const signIn = useCallback(async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }, []);

    const signUp = useCallback(async (email, password, metadata = {}) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                },
            });

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            setUser(null);
            setProfile(null);

            return { error: null };
        } catch (error) {
            return { error };
        }
    }, []);

    const resetPassword = useCallback(async (email) => {
        try {
            // Use production URL from env, fallback to current origin
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${baseUrl}/reset-password`,
            });

            if (error) throw error;

            return { error: null };
        } catch (error) {
            return { error };
        }
    }, []);


    const updateProfile = useCallback(async (updates) => {
        try {
            if (!user) throw new Error('No user logged in');

            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            setProfile(data);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }, [user]);

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin',
        isSuperAdmin: profile?.role === 'super_admin',
    }), [user, profile, loading, signIn, signUp, signOut, resetPassword, updateProfile]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;

