// @ts-nocheck
'use client';

/**
 * Client-side image optimization utility
 * Compresses and resizes images before upload to reduce bandwidth and storage costs
 */

// Configuration for different image types
const IMAGE_CONFIGS = {
    photo: { maxWidth: 800, maxHeight: 800, quality: 0.70 },
    logo: { maxWidth: 512, maxHeight: 512, quality: 0.75 },
    background: { maxWidth: 1200, maxHeight: 800, quality: 0.65 },
    thumbnail: { maxWidth: 200, maxHeight: 200, quality: 0.70 },
};

const MAX_FILE_SIZE_KB = 500;

/**
 * Main entry point for image optimization
 * @param {File} file - The image file to optimize
 * @param {Object} options - Optimization options
 * @param {string} options.type - Type of image: 'photo', 'logo', 'background', 'thumbnail'
 * @returns {Promise<{blob: Blob, dataUrl: string, width: number, height: number}>}
 */
export async function optimizeImage(file, options = {}) {
    const { type = 'photo', skipOptimization = false, qualityOverride = null } = options;
    const config = IMAGE_CONFIGS[type] || IMAGE_CONFIGS.photo;

    // 0. If skipOptimization is true, return a simple data URL and original blob but converted to WebP for consistency
    // OR just return the original file if we want absolute zero compression. 
    // The user asked "do not compress", so we will keep it as original as possible.

    // Validate input
    if (!file || !file.type.startsWith('image/')) {
        throw new Error('Invalid file: must be an image');
    }

    // 0. High-Res Pass-Through
    if (skipOptimization) {
        return {
            blob: file,
            dataUrl: await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            }),
            width: 0, // Not needed for pass-through
            height: 0,
            originalSize: file.size,
            optimizedSize: file.size,
            compressionRatio: 0,
            bypassed: true
        };
    }

    // Load image
    const img = await loadImage(file);

    // Calculate new dimensions
    const { width, height } = calculateDimensions(
        img.width,
        img.height,
        config.maxWidth,
        config.maxHeight
    );

    // Create canvas and draw resized image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to WebP with progressive quality reduction if needed
    let blob = await canvasToBlob(canvas, 'image/webp', config.quality);
    let currentQuality = config.quality;

    // Progressively reduce quality until under max size
    while (blob.size > MAX_FILE_SIZE_KB * 1024 && currentQuality > 0.3) {
        currentQuality -= 0.05;
        blob = await canvasToBlob(canvas, 'image/webp', currentQuality);
    }

    // If still too large, also reduce dimensions
    if (blob.size > MAX_FILE_SIZE_KB * 1024) {
        const scaleFactor = Math.sqrt((MAX_FILE_SIZE_KB * 1024) / blob.size);
        const newWidth = Math.floor(width * scaleFactor);
        const newHeight = Math.floor(height * scaleFactor);

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        blob = await canvasToBlob(canvas, 'image/webp', 0.60);
    }

    const dataUrl = canvas.toDataURL('image/webp', currentQuality);

    return {
        blob,
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        originalSize: file.size,
        optimizedSize: blob.size,
        compressionRatio: ((1 - blob.size / file.size) * 100).toFixed(1),
    };
}

/**
 * Load an image file into an HTMLImageElement
 * @param {File|Blob} file 
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error('Failed to load image'));
        };
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Calculate new dimensions maintaining aspect ratio
 * @param {number} originalWidth 
 * @param {number} originalHeight 
 * @param {number} maxWidth 
 * @param {number} maxHeight 
 * @returns {{width: number, height: number}}
 */
function calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let width = originalWidth;
    let height = originalHeight;

    // Only resize if larger than max dimensions
    if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio);

        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
    }

    return { width, height };
}

/**
 * Convert canvas to blob
 * @param {HTMLCanvasElement} canvas 
 * @param {string} type 
 * @param {number} quality 
 * @returns {Promise<Blob>}
 */
function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to convert canvas to blob'));
                }
            },
            type,
            quality
        );
    });
}

/**
 * Get a preview data URL for immediate display
 * @param {File} file 
 * @param {number} maxWidth 
 * @returns {Promise<string>}
 */
export async function getImagePreview(file, maxWidth = 200) {
    const img = await loadImage(file);
    const { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxWidth);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL('image/webp', 0.6);
}

/**
 * Validate file type
 * @param {File} file 
 * @returns {boolean}
 */
export function isValidImageType(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    return validTypes.includes(file.type);
}

/**
 * Format file size for display
 * @param {number} bytes 
 * @returns {string}
 */
export function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
