import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { uploadToR2, generateObjectKey, isAllowedContentType } from '@/lib/storage/r2';

const MAX_FILE_SIZE = 500 * 1024; // 500 KB

interface UploadResponse {
    success: boolean;
    url?: string;
    key?: string;
    size?: number;
    contentType?: string;
    error?: string;
}

const ALLOWED_FOLDERS = [
    'cv-photos',
    'menu-items',
    'menu-categories',
    'logos',
    'invoice-logos',
    'qr-logos',
    'card-logos',
    'backgrounds',
    'uploads'
] as const;

type AllowedFolder = typeof ALLOWED_FOLDERS[number];

/**
 * POST /api/upload
 * Upload an optimized image to Cloudflare R2
 * 
 * Request body: FormData with:
 * - file: The image file (should be pre-optimized on client)
 * - folder: Target folder (cv-photos, menu-items, logos, etc.)
 */
export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
    try {
        // 1. Authenticate user
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        // 2. Parse form data
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = (formData.get('folder') as string) || 'uploads';

        if (!file || !(file instanceof Blob)) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // 3. Validate file type
        const contentType = file.type;
        if (!isAllowedContentType(contentType)) {
            return NextResponse.json(
                { success: false, error: `Invalid file type: ${contentType}. Only images are allowed.` },
                { status: 400 }
            );
        }

        // 4. Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: `File too large: ${(file.size / 1024).toFixed(1)}KB. Maximum is ${MAX_FILE_SIZE / 1024}KB.` },
                { status: 400 }
            );
        }

        // 5. Sanitize folder name
        const sanitizedFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        const targetFolder: AllowedFolder = ALLOWED_FOLDERS.includes(sanitizedFolder as AllowedFolder)
            ? (sanitizedFolder as AllowedFolder)
            : 'uploads';

        // 6. Generate object key and upload
        const originalName = (file as File).name || 'image.webp';
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
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('R2') || errorMessage.includes('configuration')) {
            return NextResponse.json(
                { success: false, error: 'Storage service not configured. Please contact support.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Upload failed. Please try again.' },
            { status: 500 }
        );
    }
}

/**
 * OPTIONS handler for CORS preflight
 * SECURITY: Restricted to same-origin only
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
    const origin = request.headers.get('origin') || '';
    const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'https://onekit.app',
    ];

    const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed));

    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Credentials': 'true',
        },
    });
}
