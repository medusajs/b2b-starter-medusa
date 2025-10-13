/**
 * Static Image Server
 * High-performance image serving with caching headers
 * GET /store/internal-catalog/cdn/:category/:filename
 */

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import fs from 'fs';
import path from 'path';

const IMAGE_BASE_PATH = path.join(__dirname, '../../../../static/images-catálogo_distribuidores');

// Image MIME types
const MIME_TYPES: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
};

export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const { category, filename } = req.params;

    try {
        // Construct file path
        const filePath = path.join(IMAGE_BASE_PATH, category, filename);

        // Security: prevent directory traversal
        if (!filePath.startsWith(IMAGE_BASE_PATH)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Access denied'
            });
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Image not found',
                path: `${category}/${filename}`
            });
        }

        // Get file stats
        const stats = fs.statSync(filePath);
        const ext = path.extname(filename).toLowerCase();
        const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

        // Set caching headers (1 year)
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('ETag', `"${stats.size}-${stats.mtime.getTime()}"`);
        res.setHeader('Last-Modified', stats.mtime.toUTCString());

        // Check if client has cached version
        const ifNoneMatch = req.headers['if-none-match'];
        const etag = `"${stats.size}-${stats.mtime.getTime()}"`;

        if (ifNoneMatch === etag) {
            return res.status(304).end();
        }

        // Stream file to response
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    } catch (error: any) {
        console.error(`Error serving image ${category}/${filename}:`, error);
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to serve image");
    }
};
