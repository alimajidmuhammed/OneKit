// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import { AuthProvider } from './AuthProvider';

export default async function ServerAuthProvider({ children }) {
    const supabase = await createClient();

    // Get user from server
    // Note: getUser() is more secure than getSession() as it verifies with Supabase auth server
    const { data: { user } } = await supabase.auth.getUser();

    let profile = null;
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        profile = data;
    }

    return (
        <AuthProvider
            initialUser={user}
            initialProfile={profile}
        >
            {children}
        </AuthProvider>
    );
}
