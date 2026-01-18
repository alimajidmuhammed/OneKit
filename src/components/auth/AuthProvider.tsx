// @ts-nocheck
'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

export function AuthProvider({ children, initialUser = null, initialProfile = null }) {
    const [user, setUser] = useState(initialUser);
    const [profile, setProfile] = useState(initialProfile);
    const [loading, setLoading] = useState(true); // Start as true to avoid hydration flicker/premature null returns
    const router = useRouter();

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
            // If we have initial data, we already set loading to false in useState
            // But we can check session here silently to ensure it's still valid
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!isMounted) return;

                // Only update if it's different to avoid re-renders
                if (session?.user?.id !== user?.id) {
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        await fetchProfile(session.user.id);
                    } else {
                        setProfile(null);
                    }
                }
            } catch (error) {
                console.error('Session check error:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        // Only run getSession if we don't have initialUser or if we want to force refresh
        if (!initialUser) {
            getSession();
        } else {
            // Already have user/profile from server, but we should still setup the listener below
            setLoading(false);
        }



        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;

                console.log('⚡️ Auth state change:', event);
                setLoading(true); // Set loading true during state transition

                try {
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        await fetchProfile(session.user.id);
                    } else {
                        setProfile(null);
                    }
                } catch (error) {
                    console.error('❌ Error processing auth state change:', error);
                } finally {
                    if (isMounted) {
                        setLoading(false);
                    }
                }
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile, initialUser]); // Added initialUser to dependency array

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
            console.log('🚪 Signing out...');
            setLoading(true);
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            setUser(null);
            setProfile(null);

            console.log('✅ Signed out successfully');
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('❌ Error during sign out:', error);
            // Even if Supabase signout fails, clear local state and redirect
            setUser(null);
            setProfile(null);
            window.location.href = '/login';
        } finally {
            setLoading(false);
        }
    }, [router]);


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
