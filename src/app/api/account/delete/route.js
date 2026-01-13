import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * DELETE /api/account/delete
 * Securely delete a user's account using service role key
 */
export async function DELETE(request) {
    try {
        // 1. Authenticate the user making the request
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        // 2. Parse request body for confirmation
        const { confirmation } = await request.json();

        if (confirmation !== 'DELETE') {
            return NextResponse.json(
                { error: 'Please type DELETE to confirm account deletion.' },
                { status: 400 }
            );
        }

        // 3. Create admin client with service role key
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // 4. Delete user data from all tables (cascade should handle related data)
        // Delete profile first
        await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', user.id);

        // Delete subscriptions
        await supabaseAdmin
            .from('subscriptions')
            .delete()
            .eq('user_id', user.id);

        // Delete payments
        await supabaseAdmin
            .from('payments')
            .delete()
            .eq('user_id', user.id);

        // Delete referral codes
        await supabaseAdmin
            .from('referral_codes')
            .delete()
            .eq('user_id', user.id);

        // Delete referrals
        await supabaseAdmin
            .from('referrals')
            .delete()
            .eq('referrer_id', user.id);

        // 5. Delete the auth user (requires service role)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (deleteError) {
            console.error('Failed to delete user:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete account. Please contact support.' },
                { status: 500 }
            );
        }

        // 6. Log the deletion for audit
        await supabaseAdmin.from('audit_log').insert({
            action: 'account_deleted',
            table_name: 'auth.users',
            record_id: user.id,
            new_data: { deleted_at: new Date().toISOString() },
        }).catch(() => { }); // Ignore if audit_log doesn't exist

        return NextResponse.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Account deletion error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
