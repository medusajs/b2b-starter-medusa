"use server";
import "server-only";
import type { ProductImage, ImageMetadata, ImageProcessingOptions, CDNConfig, ImageCacheEntry } from "./types";

// Image processing utilities
export function generateImageSizes(baseWidth: number, baseHeight: number): Array<{ size: string; width: number; height: number }> {
    const aspectRatio = baseWidth / baseHeight;

    return [
        { size: 'thumbnail', width: 150, height: Math.round(150 / aspectRatio) },
        { size: 'small', width: 300, height: Math.round(300 / aspectRatio) },
        { size: 'medium', width: 600, height: Math.round(600 / aspectRatio) },
        { size: 'large', width: 1200, height: Math.round(1200 / aspectRatio) },
        { size: 'xlarge', width: 1920, height: Math.round(1920 / aspectRatio) },
    ];
}

export function getImageUrl(baseUrl: string, imageId: string, size?: string, format?: string): string {
    const sizeParam = size ? `/${size}` : '';
    const formatParam = format ? `?format=${format}` : '';
    return `${baseUrl}/images/${imageId}${sizeParam}${formatParam}`;
}

export function getImageMetadata(image: ProductImage): ImageMetadata {
    return {
        width: image.width,
        height: image.height,
        size: image.size,
        format: getImageFormatFromUrl(image.url),
        url: image.url,
    };
}

export function getImageFormatFromUrl(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'jpeg';
        case 'png':
            return 'png';
        case 'webp':
            return 'webp';
        case 'gif':
            return 'gif';
        default:
            return 'jpeg';
    }
}

// Image optimization utilities
export function getOptimalImageFormat(supportedFormats: string[] = ['webp', 'jpeg', 'png']): string {
    // Prefer WebP for modern browsers, fallback to JPEG
    if (supportedFormats.includes('webp')) {
        return 'webp';
    }
    if (supportedFormats.includes('jpeg')) {
        return 'jpeg';
    }
    return supportedFormats[0] || 'jpeg';
}

export function calculateImageQuality(size: string): number {
    switch (size) {
        case 'thumbnail':
            return 70;
        case 'small':
            return 80;
        case 'medium':
            return 85;
        case 'large':
            return 90;
        case 'xlarge':
            return 95;
        default:
            return 85;
    }
}

export function shouldPreloadImage(image: ProductImage, viewportWidth: number = 1920): boolean {
    // Preload images that are likely to be in viewport
    if (image.isPrimary) return true;
    if (image.size === 'medium' && viewportWidth >= 768) return true;
    if (image.size === 'large' && viewportWidth >= 1200) return true;
    return false;
}

// CDN utilities
export function buildCDNUrl(config: CDNConfig, imageId: string, options?: ImageProcessingOptions): string {
    const { baseUrl } = config;
    let url = `${baseUrl}/${imageId}`;

    if (options) {
        const params = new URLSearchParams();

        if (options.width) params.append('w', options.width.toString());
        if (options.height) params.append('h', options.height.toString());
        if (options.quality) params.append('q', options.quality.toString());
        if (options.format) params.append('f', options.format);
        if (options.fit) params.append('fit', options.fit);

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    return url;
}

export function getCDNHeaders(config: CDNConfig): Record<string, string> {
    const headers: Record<string, string> = {
        'Cache-Control': 'public, max-age=31536000, immutable',
    };

    if (config.accessKey && config.secretKey) {
        // Add authentication headers if needed
        headers['Authorization'] = `Bearer ${config.accessKey}`;
    }

    return headers;
}

// Image validation utilities
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (file.size > maxSize) {
        return { valid: false, error: 'Image file size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Image must be JPEG, PNG, WebP, or GIF format' };
    }

    return { valid: true };
}

export function validateImageDimensions(width: number, height: number): { valid: boolean; error?: string } {
    const minWidth = 100;
    const minHeight = 100;
    const maxWidth = 4096;
    const maxHeight = 4096;

    if (width < minWidth || height < minHeight) {
        return { valid: false, error: `Image dimensions must be at least ${minWidth}x${minHeight} pixels` };
    }

    if (width > maxWidth || height > maxHeight) {
        return { valid: false, error: `Image dimensions must not exceed ${maxWidth}x${maxHeight} pixels` };
    }

    return { valid: true };
}

// Image transformation utilities
export function calculateAspectRatio(width: number, height: number): number {
    return width / height;
}

export function resizeImage(width: number, height: number, targetWidth: number, targetHeight?: number): { width: number; height: number } {
    const aspectRatio = calculateAspectRatio(width, height);

    if (targetHeight) {
        return {
            width: targetWidth,
            height: targetHeight,
        };
    }

    return {
        width: targetWidth,
        height: Math.round(targetWidth / aspectRatio),
    };
}

export function cropImage(width: number, height: number, targetWidth: number, targetHeight: number): { x: number; y: number; width: number; height: number } {
    const sourceAspect = calculateAspectRatio(width, height);
    const targetAspect = calculateAspectRatio(targetWidth, targetHeight);

    let cropWidth = width;
    let cropHeight = height;
    let x = 0;
    let y = 0;

    if (sourceAspect > targetAspect) {
        // Source is wider, crop width
        cropWidth = height * targetAspect;
        x = (width - cropWidth) / 2;
    } else {
        // Source is taller, crop height
        cropHeight = width / targetAspect;
        y = (height - cropHeight) / 2;
    }

    return { x, y, width: cropWidth, height: cropHeight };
}

// Cache utilities
export function createImageCacheKey(imageId: string, size?: string, format?: string): string {
    const sizePart = size ? `_${size}` : '';
    const formatPart = format ? `_${format}` : '';
    return `img_${imageId}${sizePart}${formatPart}`;
}

export function isImageCacheValid(entry: ImageCacheEntry, ttl: number = 3600000): boolean {
    // 1 hour default TTL
    return Date.now() - entry.timestamp < ttl;
}

export function calculateImageCacheSize(images: ProductImage[]): number {
    // Rough estimation: 1KB per image metadata
    return images.length * 1024;
}

// Lazy loading utilities
export function generateImageSrcSet(image: ProductImage, sizes: number[]): string {
    return sizes
        .map(size => {
            const scaledWidth = Math.min(image.width, size);
            const _scaledHeight = Math.round((scaledWidth / image.width) * image.height);
            return `${getImageUrl('https://cdn.example.com', image.id, 'custom', 'webp')} ${scaledWidth}w`;
        })
        .join(', ');
}

export function generateImageSizesAttribute(sizes: number[]): string {
    return sizes.map(size => `(max-width: ${size}px) ${size}px`).join(', ') + ', 100vw';
}

// Accessibility utilities
export function generateImageAltText(image: ProductImage, productName?: string): string {
    if (image.alt && image.alt.trim()) {
        return image.alt;
    }

    if (productName) {
        return `Imagem do produto ${productName}`;
    }

    return 'Imagem do produto';
}

export function generateImageTitle(image: ProductImage, productName?: string): string {
    if (productName) {
        return `${productName} - ${image.size}`;
    }

    return `Imagem ${image.size}`;
}

// Performance utilities
export function getImageLoadingPriority(image: ProductImage, index: number): 'high' | 'low' | 'auto' {
    if (image.isPrimary || index === 0) {
        return 'high';
    }

    if (index < 3) {
        return 'auto';
    }

    return 'low';
}

export function shouldUseWebP(image: ProductImage, supportsWebP: boolean = true): boolean {
    return supportsWebP && image.size !== 'original';
}

// Error handling utilities
export function createImageError(message: string, code: string): Error {
    const error = new Error(message);
    (error as Error & { code: string }).code = code;
    return error;
}

export function handleImageLoadError(image: ProductImage): ProductImage {
    // Return a fallback image or placeholder
    return {
        ...image,
        url: '/images/placeholder.png',
        alt: 'Imagem não disponível',
    };
}

// Batch processing utilities
export function processImagesBatch(
    images: ProductImage[],
    batchSize: number = 10
): ProductImage[][] {
    const batches: ProductImage[][] = [];

    for (let i = 0; i < images.length; i += batchSize) {
        batches.push(images.slice(i, i + batchSize));
    }

    return batches;
}

export function calculateBatchProcessingTime(images: ProductImage[], processingTimePerImage: number = 100): number {
    return images.length * processingTimePerImage;
}