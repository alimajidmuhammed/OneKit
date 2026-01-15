import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
    // Create Supabase admin client inside handler
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {

        const { accessToken, refreshToken, newPassword } = await request.json();

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        if (!accessToken) {
            return NextResponse.json(
                { error: 'No access token provided' },
                { status: 401 }
            );
        }

        // Get user from access token
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);

        if (userError || !user) {
            console.error('User lookup error:', userError);
            return NextResponse.json(
                { error: 'Invalid or expired session. Please request a new reset link.' },
                { status: 401 }
            );
        }

        // Update the user's password using admin API
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );

        if (updateError) {
            console.error('Password update error:', updateError);
            return NextResponse.json(
                { error: updateError.message || 'Failed to update password' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Reset password API error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
