/**
 * 🌍 YSH API Versioning Utilities
 * Manages API versioning, backward compatibility, and version headers
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

// ============================================================================
// Version Configuration
// ============================================================================

export interface APIVersion {
    major: number;
    minor: number;
    patch: number;
    label?: string; // e.g., "beta", "rc1"
}

export const CURRENT_API_VERSION: APIVersion = {
    major: 1,
    minor: 0,
    patch: 0,
};

export const SUPPORTED_VERSIONS: APIVersion[] = [
    { major: 1, minor: 0, patch: 0 },
    { major: 0, minor: 9, patch: 0 }, // Legacy support
];

// ============================================================================
// Version Parsing and Validation
// ============================================================================

export class APIVersionManager {
    static CURRENT_API_VERSION = CURRENT_API_VERSION;
    static SUPPORTED_VERSIONS = SUPPORTED_VERSIONS;
    /**
     * Parse version string (e.g., "1.0.0", "v1.0.0-beta")
     */
    static parseVersion(versionStr: string): APIVersion | null {
        const cleanVersion = versionStr.replace(/^v/, '');
        const parts = cleanVersion.split('-');
        const versionParts = parts[0].split('.');

        if (versionParts.length !== 3) return null;

        const [major, minor, patch] = versionParts.map(Number);
        if (isNaN(major) || isNaN(minor) || isNaN(patch)) return null;

        return {
            major,
            minor,
            patch,
            label: parts[1],
        };
    }

    /**
     * Format version to string
     */
    static formatVersion(version: APIVersion): string {
        const base = `${version.major}.${version.minor}.${version.patch}`;
        return version.label ? `${base}-${version.label}` : base;
    }

    /**
     * Check if version is supported
     */
    static isVersionSupported(version: APIVersion): boolean {
        return SUPPORTED_VERSIONS.some(supported =>
            supported.major === version.major &&
            supported.minor === version.minor &&
            supported.patch === version.patch
        );
    }

    /**
     * Get version from request headers
     */
    static getVersionFromRequest(req: MedusaRequest): APIVersion {
        const acceptHeader = (req as any).headers?.accept || (req as any).get?.('accept') || '';
        const versionMatch = acceptHeader.match(/version=(\d+\.\d+\.\d+)/i);

        if (versionMatch) {
            const parsed = this.parseVersion(versionMatch[1]);
            if (parsed && this.isVersionSupported(parsed)) {
                return parsed;
            }
        }

        // Fallback to current version
        return CURRENT_API_VERSION;
    }

    /**
     * Add version headers to response
     */
    static addVersionHeaders(res: MedusaResponse, version: APIVersion = CURRENT_API_VERSION): void {
        res.setHeader('X-API-Version', this.formatVersion(version));
        res.setHeader('X-API-Supported-Versions', SUPPORTED_VERSIONS.map(v => this.formatVersion(v)).join(', '));
        res.setHeader('X-API-Current-Version', this.formatVersion(CURRENT_API_VERSION));
    }

    /**
     * Check if client version requires compatibility mode
     */
    static requiresCompatibilityMode(clientVersion: APIVersion): boolean {
        return clientVersion.major < CURRENT_API_VERSION.major ||
            (clientVersion.major === CURRENT_API_VERSION.major &&
                clientVersion.minor < CURRENT_API_VERSION.minor);
    }
}

// ============================================================================
// Version-Specific Response Transformers
// ============================================================================

export class VersionedResponseTransformer {
    /**
     * Transform response based on client version
     */
    static transformResponse<T>(
        data: T,
        clientVersion: APIVersion,
        transformers: Record<string, (data: any) => any>
    ): T {
        const versionKey = `${clientVersion.major}.${clientVersion.minor}`;

        if (transformers[versionKey]) {
            return transformers[versionKey](data);
        }

        // Return data as-is for current version
        return data;
    }

    /**
     * Solar Detection v0.9 compatibility transformer
     */
    static transformSolarDetectionV09(data: any): any {
        // v0.9 had different field names
        return {
            ...data,
            detection: {
                ...data.detection,
                total_panels: data.detection.panels_detected, // renamed field
                estimated_power_kw: data.detection.estimated_capacity_kwp, // renamed field
            },
            // Remove new fields not in v0.9
            panels: data.panels.map(panel => ({
                ...panel,
                // Remove azimuth_degrees if it didn't exist in v0.9
                azimuth_degrees: undefined,
            })),
        };
    }

    /**
     * Thermal Analysis v0.9 compatibility transformer
     */
    static transformThermalAnalysisV09(data: any): any {
        return {
            ...data,
            analysis: {
                ...data.analysis,
                // v0.9 had different field structure
                healthy_percentage: data.analysis.total_modules > 0
                    ? (data.analysis.healthy_modules / data.analysis.total_modules) * 100
                    : 0,
            },
        };
    }
}

// ============================================================================
// Middleware for Version Handling
// ============================================================================

export function apiVersionMiddleware() {
    return async (req: MedusaRequest, res: MedusaResponse, next: () => Promise<void>) => {
        try {
            const clientVersion = APIVersionManager.getVersionFromRequest(req);

            // Store version in request for use in handlers
            (req as any).apiVersion = clientVersion;

            // Add version headers to response
            APIVersionManager.addVersionHeaders(res, clientVersion);

            // Check for deprecated versions
            if (clientVersion.major === 0) {
                res.setHeader('X-API-Deprecation-Notice',
                    'API version 0.x is deprecated. Please upgrade to v1.0.0. Support will be removed in 6 months.');
            }

            await next();
        } catch (error) {
            console.error('[API Version] Error in version middleware:', error);
            await next();
        }
    };
}

// ============================================================================
// Version Negotiation Helpers
// ============================================================================

export class VersionNegotiation {
    /**
     * Negotiate best version based on client capabilities
     */
    static negotiateVersion(acceptHeader: string): APIVersion {
        const versions = this.parseAcceptVersionHeader(acceptHeader);

        // Find highest supported version
        for (const version of versions) {
            if (APIVersionManager.isVersionSupported(version)) {
                return version;
            }
        }

        return CURRENT_API_VERSION;
    }

    /**
     * Parse Accept header for version preferences
     */
    private static parseAcceptVersionHeader(acceptHeader: string): APIVersion[] {
        const versions: APIVersion[] = [];

        // Look for version parameters
        const versionMatches = acceptHeader.match(/version=([^\s;,]+)/gi);
        if (versionMatches) {
            for (const match of versionMatches) {
                const versionStr = match.split('=')[1];
                const parsed = APIVersionManager.parseVersion(versionStr);
                if (parsed) {
                    versions.push(parsed);
                }
            }
        }

        return versions.length > 0 ? versions : [CURRENT_API_VERSION];
    }
}