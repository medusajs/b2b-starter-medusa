/**
 * 🌞 YSH Solar Detection API - Panel-Segmentation Integration
 * High-Performance Endpoint for Remote Solar Panel Detection
 * 
 * @swagger
 * /store/solar-detection:
 *   post:
 *     tags: [Solar Computer Vision]
 *     summary: Detect solar panels from satellite imagery
 *     description: Uses NREL Panel-Segmentation for automated detection
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";
import type { GeoJSON } from "../../../types/solar-cv";

// ============================================================================
// DTOs & Validation Schemas
// ============================================================================

const SolarDetectionRequestSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional(),
    zoom: z.number().min(18).max(21).default(20),
    imagery_source: z.enum(["google", "maxar", "nearmap"]).default("google"),
    detect_orientation: z.boolean().default(false),
    detect_mounting: z.boolean().default(false),
    estimate_capacity: z.boolean().default(true),
});

export type SolarDetectionRequest = z.infer<typeof SolarDetectionRequestSchema>;

interface DetectedPanel {
    id: string;
    geometry: GeoJSON.Polygon;
    area_m2: number;
    estimated_modules: number;
    confidence: number;
    tilt_degrees?: number;
    azimuth_degrees?: number;
    mounting_type?: "rooftop" | "ground" | "carport" | "tracker";
}

interface SolarDetectionResponse {
    success: boolean;
    location: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    detection: {
        panels_detected: number;
        total_area_m2: number;
        estimated_capacity_kwp: number;
        average_confidence: number;
    };
    panels: DetectedPanel[];
    imagery: {
        source: string;
        resolution_cm: number;
        capture_date?: string;
    };
    processing: {
        duration_ms: number;
        model_version: string;
    };
}

// ============================================================================
// Core Detection Service
// ============================================================================

class PanelSegmentationService {
    private static instance: PanelSegmentationService;
    private cache: Map<string, { data: any; timestamp: number }>;
    private readonly CACHE_TTL = 3600000; // 1 hour

    private constructor() {
        this.cache = new Map();
    }

    static getInstance(): PanelSegmentationService {
        if (!PanelSegmentationService.instance) {
            PanelSegmentationService.instance = new PanelSegmentationService();
        }
        return PanelSegmentationService.instance;
    }

    /**
     * Execute panel detection with caching
     */
    async detectPanels(params: SolarDetectionRequest): Promise<SolarDetectionResponse> {
        const cacheKey = this.getCacheKey(params);
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        const startTime = Date.now();

        try {
            // Call Python microservice or direct integration
            const detectionResult = await this.callPanelSegmentation(params);

            const response: SolarDetectionResponse = {
                success: true,
                location: {
                    latitude: params.latitude,
                    longitude: params.longitude,
                    address: params.address,
                },
                detection: detectionResult.summary,
                panels: detectionResult.panels,
                imagery: detectionResult.imagery,
                processing: {
                    duration_ms: Date.now() - startTime,
                    model_version: "nrel-panel-seg-v2.1",
                },
            };

            this.setCache(cacheKey, response);
            return response;

        } catch (error) {
            throw new Error(`Panel detection failed: ${error.message}`);
        }
    }

    /**
     * Call Python Panel-Segmentation microservice
     */
    private async callPanelSegmentation(params: SolarDetectionRequest): Promise<any> {
        const pythonServiceUrl = process.env.PANEL_SEGMENTATION_SERVICE_URL || "http://localhost:8001";

        const response = await fetch(`${pythonServiceUrl}/api/v1/detect`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": process.env.PANEL_SEGMENTATION_API_KEY || "",
            },
            body: JSON.stringify({
                lat: params.latitude,
                lon: params.longitude,
                zoom: params.zoom,
                source: params.imagery_source,
                detect_orientation: params.detect_orientation,
                detect_mounting: params.detect_mounting,
            }),
            signal: AbortSignal.timeout(30000), // 30s timeout
        });

        if (!response.ok) {
            throw new Error(`Service returned ${response.status}`);
        }

        return await response.json();
    }

    private getCacheKey(params: SolarDetectionRequest): string {
        return `panel-det:${params.latitude.toFixed(6)},${params.longitude.toFixed(6)}:${params.zoom}`;
    }

    private getFromCache(key: string): SolarDetectionResponse | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > this.CACHE_TTL) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    private setCache(key: string, data: SolarDetectionResponse): void {
        this.cache.set(key, { data, timestamp: Date.now() });

        // Cleanup old entries
        if (this.cache.size > 1000) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
    }
}

// ============================================================================
// HTTP Handlers
// ============================================================================

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        // Check if file was uploaded
        const file = (req as any).file;
        if (!file) {
            res.status(400).json({
                success: false,
                error: "No image file provided",
            });
            return;
        }

        // For now, return mock response - will be replaced with real NREL service
        const mockResponse = {
            panels: [
                {
                    id: "panel_001",
                    bbox: [100, 200, 300, 400],
                    confidence: 0.95,
                    area: 2.5,
                },
                {
                    id: "panel_002",
                    bbox: [350, 200, 550, 400],
                    confidence: 0.88,
                    area: 2.5,
                },
            ],
            totalPanels: 2,
            totalArea: 5.0,
            processingTime: 1.2,
        };

        res.status(200).json(mockResponse);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Internal server error",
        });
    }
}

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    res.status(200).json({
        service: "YSH Solar Detection API",
        version: "1.0.0",
        status: "operational",
        endpoints: {
            POST: "/store/solar-detection",
            capabilities: [
                "satellite_imagery_analysis",
                "panel_segmentation",
                "capacity_estimation",
                "orientation_detection",
                "mounting_classification",
            ],
        },
    });
}
