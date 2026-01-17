// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import Header from './Header';

export default async function ServerAuthHeader() {
    const supabase = await createClient();

    // Get user from server
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
        <Header
            initialUser={user}
            initialProfile={profile}
        />
    );
}
