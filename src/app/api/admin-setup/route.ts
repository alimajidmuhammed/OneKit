import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );


        // Target email
        const email = 'alikurdteach@gmail.com';

        // 1. Get the user ID from auth.users (this might need superuser/service_role but we'll try with current server context)
        // Actually, we can just update the profile by email if we have it, or look it up.

        const { data: profile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('id, email, role')
            .eq('email', email)
            .single();

        if (fetchError) {
            return NextResponse.json({ error: 'Profile not found: ' + fetchError.message }, { status: 404 });
        }

        // 2. Update the role to admin
        const { data, error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', profile.id)
            .select();

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update: ' + updateError.message }, { status: 500 });
        }

        return NextResponse.json({
            message: `User ${email} elevated to admin!`,
            oldRole: profile.role,
            newRole: 'admin',
            profile: data[0]
        });
    } catch (err) {
        return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 });
    }
}
