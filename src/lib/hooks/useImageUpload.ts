// @ts-nocheck
'use client';

import { useState, useCallback } from 'react';
import { optimizeImage, isValidImageType, formatFileSize } from '@/lib/utils/imageOptimizer';

/**
 * Unified image upload hook
 * Handles client-side optimization and upload to R2
 * 
 * @example
 * const { uploadImage, uploading, error, progress } = useImageUpload();
 * const url = await uploadImage(file, { folder: 'cv-photos', type: 'photo' });
 */
export function useImageUpload() {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState({ stage: 'idle', percent: 0 });

    /**
     * Upload and optimize an image
     * @param {File} file - The image file to upload
     * @param {Object} options - Upload options
     * @param {string} options.folder - Target folder (cv-photos, menu-items, logos, etc.)
     * @param {string} options.type - Image type for optimization (photo, logo, background, thumbnail)
     * @returns {Promise<string|null>} Public URL of uploaded image, or null on error
     */
    const uploadImage = useCallback(async (file, options = {}) => {
        const {
            folder = 'uploads',
            type = 'photo',
            skipOptimization = false,
            maxSizeMB = 0.5
        } = options;

        setError(null);
        setUploading(true);
        setProgress({ stage: 'validating', percent: 10 });

        try {
            // 1. Validate file type
            if (!isValidImageType(file)) {
                throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP).');
            }

            // 1b. Validate file size
            if (file.size > maxSizeMB * 1024 * 1024) {
                throw new Error(`File is too large. Maximum size for this upload is ${maxSizeMB}MB.`);
            }

            // 2. Optimize image
            setProgress({ stage: 'optimizing', percent: 30 });
            const optimized = await optimizeImage(file, { type, skipOptimization });

            if (optimized.bypassed) {
                console.log(`Image optimization bypassed: ${formatFileSize(optimized.originalSize)}`);
            } else {
                console.log(`Image optimized: ${formatFileSize(optimized.originalSize)} → ${formatFileSize(optimized.optimizedSize)} (${optimized.compressionRatio}% reduction)`);
            }

            // 3. Create form data
            setProgress({ stage: 'uploading', percent: 60 });

            const formData = new FormData();
            formData.append('file', optimized.blob, `optimized.webp`);
            formData.append('folder', folder);

            // 4. Upload to API
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            setProgress({ stage: 'complete', percent: 100 });

            return result.url;

        } catch (err) {
            console.error('Image upload error:', err);
            setError(err.message || 'Upload failed');
            return null;
        } finally {
            setUploading(false);
            // Reset progress after a delay
            setTimeout(() => {
                setProgress({ stage: 'idle', percent: 0 });
            }, 1000);
        }
    }, []);

    /**
     * Delete an image from R2 storage
     * @param {string} url - Public URL of the image to delete
     * @returns {Promise<boolean>} True if successful
     */
    const deleteImage = useCallback(async (url) => {
        if (!url) return false;

        try {
            const response = await fetch('/api/upload/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                console.error('Failed to delete image:', url);
                return false;
            }

            return true;
        } catch (err) {
            console.error('Delete image error:', err);
            return false;
        }
    }, []);

    /**
     * Get a quick preview URL before upload
     * @param {File} file 
     * @returns {Promise<string>} Data URL for preview
     */
    const getPreview = useCallback(async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }, []);

    /**
     * Clear any existing error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        uploadImage,
        deleteImage,
        uploading,
        error,
        progress,
        getPreview,
        clearError,
    };
}

export default useImageUpload;

