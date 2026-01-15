'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

// Get supabase client once at module level
const supabase = getSupabaseClient();

const AuthContext = createContext({
    user: null,
    profile: null,
    loading: true,
    updateProfile: async () => { },
    refreshProfile: async () => { },
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
                console.warn('Profile fetch issue:', error.message);
                return null;
            }

            setProfile(data);
            return data;
        } catch (error) {
            if (error?.name === 'AbortError') return null;
            return null;
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
                if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
                    return;
                }
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

    const refreshProfile = useCallback(async () => {
        if (user?.id) {
            return await fetchProfile(user.id);
        }
        return null;
    }, [user, fetchProfile]);

    const signOut = useCallback(async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setUser(null);
            setProfile(null);
            // Redirect to login
            window.location.href = '/login';
            return { error: null };
        } catch (error) {
            return { error };
        }
    }, []);


    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        user,
        profile,
        loading,
        signOut,
        updateProfile,
        refreshProfile,
        isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin',
        isSuperAdmin: profile?.role === 'super_admin',
    }), [user, profile, loading, signOut, updateProfile, refreshProfile]);

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
