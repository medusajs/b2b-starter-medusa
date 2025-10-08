/**
 * 🔥 YSH Thermal Analysis API - PV-Hawk Integration
 * High-Performance Endpoint for Thermal Anomaly Detection
 * 
 * @swagger
 * /store/thermal-analysis:
 *   post:
 *     tags: [Solar Computer Vision]
 *     summary: Analyze thermal imagery for PV defects
 *     description: Uses PV-Hawk for automated thermal anomaly detection
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";

// ============================================================================
// DTOs & Validation Schemas
// ============================================================================

const ThermalAnalysisRequestSchema = z.object({
    video_url: z.string().url().optional(),
    video_file: z.string().optional(), // Base64 or storage path
    imagery_type: z.enum(["thermal_ir", "rgb", "both"]).default("thermal_ir"),
    plant_id: z.string().optional(),
    georeferencing: z.boolean().default(true),
    detect_hotspots: z.boolean().default(true),
    detect_shading: z.boolean().default(true),
    detect_soiling: z.boolean().default(true),
    temperature_threshold_c: z.number().default(75),
});

export type ThermalAnalysisRequest = z.infer<typeof ThermalAnalysisRequestSchema>;

interface DetectedAnomaly {
    id: string;
    type: "hotspot" | "cold_cell" | "shading" | "soiling" | "cracking" | "delamination";
    severity: "critical" | "major" | "minor";
    confidence: number;
    module_id: string;
    coordinates: {
        lat: number;
        lon: number;
    };
    temperature_max_c?: number;
    affected_area_pct: number;
    frame_number: number;
    timestamp: string;
}

interface ThermalAnalysisResponse {
    success: boolean;
    plant_id?: string;
    analysis: {
        total_modules: number;
        healthy_modules: number;
        modules_with_anomalies: number;
        critical_issues: number;
        major_issues: number;
        minor_issues: number;
    };
    anomalies: DetectedAnomaly[];
    thermal_map: {
        url: string;
        format: "geotiff" | "png";
        max_temp_c: number;
        min_temp_c: number;
        avg_temp_c: number;
    };
    processing: {
        duration_ms: number;
        frames_processed: number;
        model_version: string;
    };
}

// ============================================================================
// Core Thermal Analysis Service
// ============================================================================

class PVHawkService {
    private static instance: PVHawkService;
    private processingQueue: Map<string, { status: string; progress: number }>;

    private constructor() {
        this.processingQueue = new Map();
    }

    static getInstance(): PVHawkService {
        if (!PVHawkService.instance) {
            PVHawkService.instance = new PVHawkService();
        }
        return PVHawkService.instance;
    }

    /**
     * Execute thermal analysis with async processing
     */
    async analyzeThermalImagery(params: ThermalAnalysisRequest): Promise<ThermalAnalysisResponse> {
        const jobId = this.generateJobId();
        this.processingQueue.set(jobId, { status: "processing", progress: 0 });

        const startTime = Date.now();

        try {
            // Call Python PV-Hawk microservice
            const analysisResult = await this.callPVHawk(params, jobId);

            const response: ThermalAnalysisResponse = {
                success: true,
                plant_id: params.plant_id,
                analysis: analysisResult.summary,
                anomalies: analysisResult.anomalies,
                thermal_map: analysisResult.thermal_map,
                processing: {
                    duration_ms: Date.now() - startTime,
                    frames_processed: analysisResult.frames_processed,
                    model_version: "pv-hawk-v1.2",
                },
            };

            this.processingQueue.delete(jobId);
            return response;

        } catch (error) {
            this.processingQueue.set(jobId, { status: "failed", progress: 0 });
            throw new Error(`Thermal analysis failed: ${error.message}`);
        }
    }

    /**
     * Call Python PV-Hawk microservice
     */
    private async callPVHawk(params: ThermalAnalysisRequest, jobId: string): Promise<any> {
        const pythonServiceUrl = process.env.PV_HAWK_SERVICE_URL || "http://localhost:8002";

        const response = await fetch(`${pythonServiceUrl}/api/v1/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": process.env.PV_HAWK_API_KEY || "",
                "X-Job-ID": jobId,
            },
            body: JSON.stringify({
                video_url: params.video_url,
                video_file: params.video_file,
                imagery_type: params.imagery_type,
                georeferencing: params.georeferencing,
                detection_config: {
                    hotspots: params.detect_hotspots,
                    shading: params.detect_shading,
                    soiling: params.detect_soiling,
                    temperature_threshold: params.temperature_threshold_c,
                },
            }),
            signal: AbortSignal.timeout(120000), // 2 min timeout for video processing
        });

        if (!response.ok) {
            throw new Error(`Service returned ${response.status}`);
        }

        return await response.json();
    }

    async getJobStatus(jobId: string): Promise<{ status: string; progress: number } | null> {
        return this.processingQueue.get(jobId) || null;
    }

    private generateJobId(): string {
        return `thermal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
        const validatedData = ThermalAnalysisRequestSchema.parse(req.body);

        // Execute analysis
        const service = PVHawkService.getInstance();
        const result = await service.analyzeThermalImagery(validatedData);

        res.status(200).json(result);
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
    req: MedusaRequest<{ job_id?: string }>,
    res: MedusaResponse
): Promise<void> {
    const jobId = req.query.job_id as string | undefined;

    if (jobId) {
        const service = PVHawkService.getInstance();
        const status = await service.getJobStatus(jobId);

        if (!status) {
            res.status(404).json({
                success: false,
                error: "Job not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            job_id: jobId,
            ...status,
        });
    } else {
        res.status(200).json({
            service: "YSH Thermal Analysis API",
            version: "1.0.0",
            status: "operational",
            endpoints: {
                POST: "/store/thermal-analysis",
                GET: "/store/thermal-analysis?job_id=xxx",
                capabilities: [
                    "thermal_ir_analysis",
                    "hotspot_detection",
                    "shading_analysis",
                    "soiling_detection",
                    "georeferenced_mapping",
                ],
            },
        });
    }
}
