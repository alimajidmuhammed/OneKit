import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { uploadToR2, generateObjectKey, isAllowedContentType } from '@/lib/storage/r2';

const MAX_FILE_SIZE = 500 * 1024; // 500 KB

/**
 * POST /api/upload
 * Upload an optimized image to Cloudflare R2
 * 
 * Request body: FormData with:
 * - file: The image file (should be pre-optimized on client)
 * - folder: Target folder (cv-photos, menu-items, logos, etc.)
 */
export async function POST(request) {
    try {
        // 1. Authenticate user
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    get(name) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        // 2. Parse form data
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'uploads';

        if (!file || !(file instanceof Blob)) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // 3. Validate file type
        const contentType = file.type;
        if (!isAllowedContentType(contentType)) {
            return NextResponse.json(
                { error: `Invalid file type: ${contentType}. Only images are allowed.` },
                { status: 400 }
            );
        }

        // 4. Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File too large: ${(file.size / 1024).toFixed(1)}KB. Maximum is ${MAX_FILE_SIZE / 1024}KB.` },
                { status: 400 }
            );
        }

        // 5. Sanitize folder name
        const sanitizedFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        const allowedFolders = [
            'cv-photos',
            'menu-items',
            'menu-categories',
            'logos',
            'invoice-logos',
            'qr-logos',
            'backgrounds',
            'uploads'
        ];

        const targetFolder = allowedFolders.includes(sanitizedFolder) ? sanitizedFolder : 'uploads';

        // 6. Generate object key and upload
        const originalName = file.name || 'image.webp';
        const objectKey = generateObjectKey(user.id, targetFolder, originalName);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { url, key } = await uploadToR2(buffer, objectKey, contentType);

        // 7. Return success response
        return NextResponse.json({
            success: true,
            url,
            key,
            size: file.size,
            contentType,
        });

    } catch (error) {
        console.error('Upload error:', error);

        // Handle specific R2 configuration errors
        if (error.message?.includes('R2') || error.message?.includes('configuration')) {
            return NextResponse.json(
                { error: 'Storage service not configured. Please contact support.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Upload failed. Please try again.' },
            { status: 500 }
        );
    }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
