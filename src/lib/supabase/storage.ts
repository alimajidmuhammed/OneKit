// @ts-nocheck
import { getSupabaseClient } from './client';

/**
 * Uploads a file to a Supabase bucket.
 * 
 * @param {File|Blob} file The file to upload
 * @param {string} bucket The bucket name (e.g., 'assets')
 * @param {string} path The path within the bucket (e.g., 'cv-photos/user-id/filename.jpg')
 * @returns {Promise<{publicUrl: string, error: any}>}
 */
export async function uploadFile(file, bucket, path) {
    const supabase = getSupabaseClient();

    try {
        // 1. Upload the file
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) throw uploadError;

        // 2. Get the public URL
        const { data: { publicUrl }, error: urlError } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        if (urlError) throw urlError;

        return { publicUrl, error: null };
    } catch (error) {
        console.error('Storage Upload Error:', error);
        return { publicUrl: null, error };
    }
}
