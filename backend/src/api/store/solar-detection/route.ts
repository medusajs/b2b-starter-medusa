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
import {
    BaseSolarCVService,
    ServiceResponse,
    FileUtils,
    SolarCVError,
    SolarCVMetrics
} from "../../../utils/solar-cv-service";
import {
    ResponseUtils,
    ErrorHandler,
    RequestValidator
} from "../../../utils/solar-cv-middleware";
import { CacheManager } from "../../../utils/cache-manager";

// ============================================================================
// Local Types
// ============================================================================

interface FileUpload {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    path: string;
    buffer?: Buffer;
}

interface DetectedPanel {
    id: string;
    geometry: any; // GeoJSON.Polygon
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
// Panel Segmentation Service
// ============================================================================

class PanelSegmentationService extends BaseSolarCVService {
    private cacheManager: CacheManager;

    constructor() {
        super("panel-segmentation");
        this.cacheManager = CacheManager.getInstance();
    }

    async detectPanelsFromImage(file: FileUpload): Promise<SolarDetectionResponse> {
        const startTime = Date.now();

        try {
            // Generate cache key based on file hash
            const cacheKey = `solar-detection:${await FileUtils.getFileHash(file.path)}`;

            // Check cache first
            const cachedResult = await this.cacheManager.get<SolarDetectionResponse>(cacheKey);
            if (cachedResult) {
                SolarCVMetrics.recordCacheHit("panel-segmentation");
                return cachedResult;
            }

            // Create FormData from file
            const formData = FileUtils.createFormDataFromFile(file);

            // Call Python service
            const response: ServiceResponse = await this.callService("/api/v1/detect", {
                method: "POST",
                formData,
            });

            if (!response.success) {
                throw new SolarCVError(
                    `Panel detection failed: ${response.error}`,
                    "DETECTION_FAILED",
                    500,
                    response.metadata
                );
            }

            // Transform response to expected format
            const result: SolarDetectionResponse = {
                success: true,
                location: {
                    latitude: -23.55, // Would come from image metadata
                    longitude: -46.63,
                },
                detection: {
                    panels_detected: response.data.totalPanels || 0,
                    total_area_m2: response.data.totalArea || 0,
                    estimated_capacity_kwp: (response.data.totalArea || 0) * 0.15, // Rough estimate
                    average_confidence: response.data.panels?.reduce((sum: number, p: any) => sum + p.confidence, 0) / (response.data.panels?.length || 1) || 0,
                },
                panels: response.data.panels || [],
                imagery: {
                    source: "satellite",
                    resolution_cm: 50, // Would come from service
                },
                processing: {
                    duration_ms: Date.now() - startTime,
                    model_version: "nrel-panel-seg-v2.1",
                },
            };

            // Cache the result for 1 hour
            await this.cacheManager.set(cacheKey, result, 3600);

            // Record metrics
            SolarCVMetrics.recordCall("panel-segmentation", Date.now() - startTime, true);

            return result;

        } catch (error) {
            SolarCVMetrics.recordCall("panel-segmentation", Date.now() - startTime, false);
            throw error;
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
    const service = new PanelSegmentationService();
    let uploadedFiles: FileUpload[] = [];

    try {
        // Validate and get uploaded file
        const file = RequestValidator.validateFilePresence(req, "image");
        uploadedFiles = [file];

        // Process detection
        const result = await service.detectPanelsFromImage(file);

        // Cleanup temp files
        await FileUtils.cleanupTempFiles(uploadedFiles.map(f => f.path));

        res.status(200).json(ResponseUtils.createSuccessResponse(result));

    } catch (error) {
        // Cleanup temp files on error
        await ErrorHandler.cleanupFiles(uploadedFiles);
        ErrorHandler.handleError(error, res);
    }
}

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const service = new PanelSegmentationService();

    res.status(200).json({
        service: "YSH Solar Detection API",
        version: "1.0.0",
        status: "operational",
        capabilities: [
            "satellite_imagery_analysis",
            "panel_segmentation",
            "capacity_estimation",
            "orientation_detection",
            "mounting_classification",
        ],
        metrics: SolarCVMetrics.getMetrics("panel-segmentation"),
    });
}
