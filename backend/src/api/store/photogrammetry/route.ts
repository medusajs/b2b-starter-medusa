/**
 * 📸 YSH Photogrammetry API - OpenDroneMap Integration
 * High-Performance Endpoint for 3D Reconstruction & Measurements
 * 
 * @swagger
 * /store/photogrammetry:
 *   post:
 *     tags: [Solar Computer Vision]
 *     summary: Generate 3D models from drone imagery
 *     description: Uses OpenDroneMap for photogrammetric reconstruction
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";
import type { GeoJSON } from "../../../types/solar-cv";

// ============================================================================
// DTOs & Validation Schemas
// ============================================================================

const PhotogrammetryRequestSchema = z.object({
    images: z.array(z.string()).min(5).max(500), // Image URLs or storage paths
    project_name: z.string().min(3).max(100),
    output_types: z.array(z.enum([
        "orthophoto",
        "dsm",
        "dtm",
        "point_cloud",
        "textured_mesh",
    ])).default(["orthophoto", "dsm", "point_cloud"]),
    gsd_cm: z.number().positive().default(2.0), // Ground Sample Distance
    min_num_features: z.number().int().positive().default(10000),
    use_gps: z.boolean().default(true),
    georeferencing: z.boolean().default(true),
    fast_orthophoto: z.boolean().default(false),
});

export type PhotogrammetryRequest = z.infer<typeof PhotogrammetryRequestSchema>;

interface RoofMeasurement {
    roof_id: string;
    geometry: GeoJSON.Polygon;
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
// Core Photogrammetry Service
// ============================================================================

class OpenDroneMapService {
    private static instance: OpenDroneMapService;
    private projectQueue: Map<string, { status: string; progress: number; eta_seconds?: number }>;

    private constructor() {
        this.projectQueue = new Map();
    }

    static getInstance(): OpenDroneMapService {
        if (!OpenDroneMapService.instance) {
            OpenDroneMapService.instance = new OpenDroneMapService();
        }
        return OpenDroneMapService.instance;
    }

    /**
     * Execute photogrammetric reconstruction
     */
    async processPhotogrammetry(params: PhotogrammetryRequest): Promise<PhotogrammetryResponse> {
        const projectId = this.sanitizeProjectName(params.project_name);
        this.projectQueue.set(projectId, { status: "initializing", progress: 0 });

        const startTime = Date.now();

        try {
            // Call OpenDroneMap service
            const result = await this.callOpenDroneMap(params, projectId);

            // Extract roof measurements for solar analysis
            const roofMeasurements = await this.extractRoofMeasurements(result);

            const response: PhotogrammetryResponse = {
                success: true,
                project_name: params.project_name,
                outputs: result.outputs,
                measurements: {
                    total_area_m2: result.total_area_m2,
                    roofs_detected: roofMeasurements,
                },
                processing: {
                    duration_ms: Date.now() - startTime,
                    images_processed: params.images.length,
                    odm_version: "odm-3.5.2",
                },
            };

            this.projectQueue.delete(projectId);
            return response;

        } catch (error) {
            this.projectQueue.set(projectId, { status: "failed", progress: 0 });
            throw new Error(`Photogrammetry processing failed: ${error.message}`);
        }
    }

    /**
     * Call OpenDroneMap processing service
     */
    private async callOpenDroneMap(params: PhotogrammetryRequest, projectId: string): Promise<any> {
        const odmServiceUrl = process.env.ODM_SERVICE_URL || "http://localhost:8003";

        // Update queue status
        this.projectQueue.set(projectId, { status: "uploading", progress: 5 });

        const response = await fetch(`${odmServiceUrl}/api/v1/process`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": process.env.ODM_API_KEY || "",
                "X-Project-ID": projectId,
            },
            body: JSON.stringify({
                images: params.images,
                project_name: params.project_name,
                options: {
                    gsd: params.gsd_cm / 100, // Convert to meters
                    min_num_features: params.min_num_features,
                    use_gps: params.use_gps,
                    georeferencing: params.georeferencing,
                    fast_orthophoto: params.fast_orthophoto,
                    outputs: params.output_types,
                },
            }),
            signal: AbortSignal.timeout(600000), // 10 min timeout
        });

        if (!response.ok) {
            throw new Error(`ODM service returned ${response.status}`);
        }

        // Poll for completion
        const result = await response.json();

        if (result.status === "processing") {
            return await this.pollProcessingStatus(projectId, odmServiceUrl);
        }

        return result;
    }

    /**
     * Poll ODM processing status
     */
    private async pollProcessingStatus(projectId: string, serviceUrl: string): Promise<any> {
        const maxAttempts = 120; // 10 minutes with 5s intervals
        let attempts = 0;

        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 5000));

            const statusResponse = await fetch(`${serviceUrl}/api/v1/status/${projectId}`, {
                headers: { "X-API-Key": process.env.ODM_API_KEY || "" },
            });

            if (!statusResponse.ok) {
                throw new Error(`Status check failed: ${statusResponse.status}`);
            }

            const status = await statusResponse.json();

            // Update queue
            this.projectQueue.set(projectId, {
                status: status.status,
                progress: status.progress || 0,
                eta_seconds: status.eta_seconds,
            });

            if (status.status === "completed") {
                return status.result;
            }

            if (status.status === "failed") {
                throw new Error(status.error || "Processing failed");
            }

            attempts++;
        }

        throw new Error("Processing timeout exceeded");
    }

    /**
     * Extract roof measurements from 3D model
     */
    private async extractRoofMeasurements(odmResult: any): Promise<RoofMeasurement[]> {
        // This would call a separate service to analyze the DSM/DTM
        // and extract roof planes suitable for solar installation

        const analysisServiceUrl = process.env.ROOF_ANALYSIS_SERVICE_URL || "http://localhost:8004";

        try {
            const response = await fetch(`${analysisServiceUrl}/api/v1/analyze-roofs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dsm_url: odmResult.outputs.dsm?.url,
                    dtm_url: odmResult.outputs.dtm?.url,
                    orthophoto_url: odmResult.outputs.orthophoto?.url,
                }),
                signal: AbortSignal.timeout(30000),
            });

            if (!response.ok) {
                console.warn("Roof analysis failed, returning empty measurements");
                return [];
            }

            const analysis = await response.json();
            return analysis.roofs || [];

        } catch (error) {
            console.warn("Roof analysis error:", error.message);
            return [];
        }
    }

    async getProjectStatus(projectId: string): Promise<any> {
        return this.projectQueue.get(projectId) || null;
    }

    private sanitizeProjectName(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
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
        // Validate request
        const validatedData = PhotogrammetryRequestSchema.parse(req.body);

        // Check if async processing requested
        const asyncMode = req.query.async === "true";

        if (asyncMode) {
            // Start async processing
            const service = OpenDroneMapService.getInstance();
            const projectId = service["sanitizeProjectName"](validatedData.project_name);

            // Fire and forget
            service.processPhotogrammetry(validatedData).catch(error => {
                console.error(`Async photogrammetry failed for ${projectId}:`, error);
            });

            res.status(202).json({
                success: true,
                message: "Processing started",
                project_id: projectId,
                status_url: `/store/photogrammetry?project_id=${projectId}`,
            });
        } else {
            // Synchronous processing
            const service = OpenDroneMapService.getInstance();
            const result = await service.processPhotogrammetry(validatedData);
            res.status(200).json(result);
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: "Invalid request parameters",
                details: error.errors,
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.message || "Internal server error",
            });
        }
    }
}

export async function GET(
    req: MedusaRequest<{ project_id?: string }>,
    res: MedusaResponse
): Promise<void> {
    const projectId = req.query.project_id as string | undefined;

    if (projectId) {
        const service = OpenDroneMapService.getInstance();
        const status = await service.getProjectStatus(projectId);

        if (!status) {
            res.status(404).json({
                success: false,
                error: "Project not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            project_id: projectId,
            ...status,
        });
    } else {
        res.status(200).json({
            service: "YSH Photogrammetry API",
            version: "1.0.0",
            status: "operational",
            endpoints: {
                POST: "/store/photogrammetry",
                GET: "/store/photogrammetry?project_id=xxx",
                capabilities: [
                    "3d_reconstruction",
                    "orthophoto_generation",
                    "elevation_models",
                    "point_cloud_generation",
                    "roof_measurement",
                    "solar_suitability_analysis",
                ],
            },
            processing_limits: {
                min_images: 5,
                max_images: 500,
                max_resolution_mp: 50,
            },
        });
    }
}
