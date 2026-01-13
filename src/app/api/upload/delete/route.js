'use server';

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { deleteFromR2, extractObjectKey } from '@/lib/storage/r2';

/**
 * DELETE /api/upload
 * Delete an image from R2 storage
 */
export async function DELETE(request) {
    try {
        // Get the authenticated user
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get the URL to delete from request body
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: 'Missing URL' },
                { status: 400 }
            );
        }

        // Extract the object key from the URL
        const objectKey = extractObjectKey(url);

        if (!objectKey) {
            return NextResponse.json(
                { error: 'Invalid R2 URL' },
                { status: 400 }
            );
        }

        // Verify the user owns this file (check if user ID is in the path)
        if (!objectKey.includes(user.id)) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Delete from R2
        const { success } = await deleteFromR2(objectKey);

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to delete file' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
