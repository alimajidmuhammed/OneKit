import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

/**
 * Cloudflare R2 Storage Configuration
 * Server-side only - used by API routes
 */

// Get R2 client instance
export function getR2Client() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
        throw new Error('Missing R2 configuration. Check environment variables.');
    }

    return new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
}

/**
 * Generate a unique object key for storage
 * @param {string} userId - User ID for organization
 * @param {string} folder - Folder type (cv-photos, menu-items, logos, etc.)
 * @param {string} originalFilename - Original filename for extension
 * @returns {string} Unique object key
 */
export function generateObjectKey(userId, folder, originalFilename) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = originalFilename?.split('.').pop() || 'webp';
    const sanitizedExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '');

    return `${folder}/${userId}/${timestamp}-${random}.${sanitizedExt}`;
}

/**
 * Get the public URL for an object
 * @param {string} objectKey - The object key in R2
 * @returns {string} Public URL
 */
export function getPublicUrl(objectKey) {
    const publicUrl = process.env.R2_PUBLIC_URL;
    if (!publicUrl) {
        throw new Error('R2_PUBLIC_URL not configured');
    }
    return `${publicUrl}/${objectKey}`;
}

/**
 * Extract object key from a public R2 URL
 * @param {string} url - Public R2 URL
 * @returns {string|null} Object key or null if not a valid R2 URL
 */
export function extractObjectKey(url) {
    const publicUrl = process.env.R2_PUBLIC_URL;
    if (!publicUrl || !url || !url.startsWith(publicUrl)) {
        return null;
    }
    return url.replace(`${publicUrl}/`, '');
}

/**
 * Upload a file to R2
 * @param {Buffer|Uint8Array} body - File content
 * @param {string} key - Object key
 * @param {string} contentType - MIME type
 * @returns {Promise<{url: string, key: string}>}
 */
export async function uploadToR2(body, key, contentType) {
    const client = getR2Client();
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!bucketName) {
        throw new Error('R2_BUCKET_NAME not configured');
    }

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000', // 1 year cache
    });

    await client.send(command);

    return {
        url: getPublicUrl(key),
        key,
    };
}

/**
 * Delete a file from R2
 * @param {string} key - Object key to delete
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteFromR2(key) {
    if (!key) return { success: false };

    const client = getR2Client();
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!bucketName) {
        throw new Error('R2_BUCKET_NAME not configured');
    }

    try {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        await client.send(command);
        return { success: true };
    } catch (error) {
        console.error('R2 delete error:', error);
        return { success: false };
    }
}

/**
 * Validate content type is an allowed image type
 * @param {string} contentType 
 * @returns {boolean}
 */
export function isAllowedContentType(contentType) {
    const allowedTypes = [
        'image/webp',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
    ];
    return allowedTypes.includes(contentType);
}

