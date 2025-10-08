/**
 * 📸 YSH Photogrammetry API - OpenDroneMap Integration
 * High-Performance Endpoint for 3D Reconstruction & Measurements
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

interface RoofMeasurement {
    roof_id: string;
    geometry: any; // GeoJSON.Polygon
    area_m2: number;
    avg_tilt_degrees: number;
    avg_azimuth_degrees: number;
    max_elevation_m: number;
    min_elevation_m: number;
    suitable_for_solar: boolean;
    estimated_panel_capacity: number;
}

interface PhotogrammetryResponse {
    success: boolean;
    project_name: string;
    outputs: {
        orthophoto?: {
            url: string;
            resolution_cm: number;
            format: "geotiff";
        };
        dsm?: {
            url: string;
            resolution_cm: number;
            format: "geotiff";
        };
        dtm?: {
            url: string;
            resolution_cm: number;
            format: "geotiff";
        };
        point_cloud?: {
            url: string;
            format: "las" | "laz";
            num_points: number;
        };
        textured_mesh?: {
            url: string;
            format: "obj" | "ply";
        };
    };
    measurements: {
        total_area_m2: number;
        roofs_detected: RoofMeasurement[];
    };
    processing: {
        duration_ms: number;
        images_processed: number;
        odm_version: string;
    };
}

// ============================================================================
// OpenDroneMap Service
// ============================================================================

class OpenDroneMapService extends BaseSolarCVService {
    constructor() {
        super("odm");
    }

    async processPhotogrammetry(files: FileUpload[]): Promise<PhotogrammetryResponse> {
        const startTime = Date.now();

        try {
            // Create FormData from files
            const formData = FileUtils.createFormDataFromFiles(files);

            // Call Python service
            const response: ServiceResponse = await this.callService("/api/v1/process", {
                method: "POST",
                formData,
            });

            if (!response.success) {
                throw new SolarCVError(
                    `Photogrammetry processing failed: ${response.error}`,
                    "PROCESSING_FAILED",
                    500,
                    response.metadata
                );
            }

            // Transform response to expected format
            const result: PhotogrammetryResponse = {
                success: true,
                project_name: "auto-generated", // Would come from request
                outputs: response.data.outputs || {},
                measurements: {
                    total_area_m2: response.data.total_area_m2 || 0,
                    roofs_detected: response.data.roofs_detected || [],
                },
                processing: {
                    duration_ms: Date.now() - startTime,
                    images_processed: files.length,
                    odm_version: "odm-3.5.2",
                },
            };

            // Record metrics
            SolarCVMetrics.recordCall("odm", Date.now() - startTime, true);

            return result;

        } catch (error) {
            SolarCVMetrics.recordCall("odm", Date.now() - startTime, false);
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
    const service = new OpenDroneMapService();
    let uploadedFiles: FileUpload[] = [];

    try {
        // Validate and get uploaded files
        const files = RequestValidator.validateFilesPresence(req, "images", 5);
        uploadedFiles = files;

        // Process photogrammetry
        const result = await service.processPhotogrammetry(files);

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
    const service = new OpenDroneMapService();

    res.status(200).json({
        service: "YSH Photogrammetry API",
        version: "1.0.0",
        status: "operational",
        capabilities: [
            "3d_reconstruction",
            "orthophoto_generation",
            "elevation_models",
            "point_cloud_generation",
            "roof_measurement",
            "solar_suitability_analysis",
        ],
        processing_limits: {
            min_images: 5,
            max_images: 50,
            max_resolution_mp: 50,
        },
        metrics: SolarCVMetrics.getMetrics("odm"),
    });
}
