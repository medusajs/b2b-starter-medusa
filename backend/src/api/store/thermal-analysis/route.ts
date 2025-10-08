/**
 * 🔥 YSH Thermal Analysis API - PV-Hawk Integration
 * High-Performance Endpoint for Thermal Anomaly Detection
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

// ============================================================================
// Local Types
// ============================================================================

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
// PV-Hawk Service
// ============================================================================

class PVHawkService extends BaseSolarCVService {
    constructor() {
        super("pv-hawk");
    }

    async analyzeThermalImage(file: FileUpload): Promise<ThermalAnalysisResponse> {
        const startTime = Date.now();

        try {
            // Create FormData from file
            const formData = FileUtils.createFormDataFromFile(file, "thermalImage");

            // Call Python service
            const response: ServiceResponse = await this.callService("/api/v1/analyze", {
                method: "POST",
                formData,
            });

            if (!response.success) {
                throw new SolarCVError(
                    `Thermal analysis failed: ${response.error}`,
                    "ANALYSIS_FAILED",
                    500,
                    response.metadata
                );
            }

            // Transform response to expected format
            const result: ThermalAnalysisResponse = {
                success: true,
                analysis: {
                    total_modules: response.data.total_modules || 0,
                    healthy_modules: response.data.healthy_modules || 0,
                    modules_with_anomalies: response.data.modules_with_anomalies || 0,
                    critical_issues: response.data.critical_issues || 0,
                    major_issues: response.data.major_issues || 0,
                    minor_issues: response.data.minor_issues || 0,
                },
                anomalies: response.data.anomalies || [],
                thermal_map: response.data.thermal_map || {
                    url: "",
                    format: "png",
                    max_temp_c: 0,
                    min_temp_c: 0,
                    avg_temp_c: 0,
                },
                processing: {
                    duration_ms: Date.now() - startTime,
                    frames_processed: response.data.frames_processed || 1,
                    model_version: "pv-hawk-v1.2",
                },
            };

            // Record metrics
            SolarCVMetrics.recordCall("pv-hawk", Date.now() - startTime, true);

            return result;

        } catch (error) {
            SolarCVMetrics.recordCall("pv-hawk", Date.now() - startTime, false);
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
    const service = new PVHawkService();
    let uploadedFiles: FileUpload[] = [];

    try {
        // Validate and get uploaded file
        const file = RequestValidator.validateFilePresence(req, "thermalImage");
        uploadedFiles = [file];

        // Process analysis
        const result = await service.analyzeThermalImage(file);

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
    const service = new PVHawkService();

    res.status(200).json({
        service: "YSH Thermal Analysis API",
        version: "1.0.0",
        status: "operational",
        capabilities: [
            "thermal_ir_analysis",
            "hotspot_detection",
            "shading_analysis",
            "soiling_detection",
            "georeferenced_mapping",
        ],
        metrics: SolarCVMetrics.getMetrics("pv-hawk"),
    });
}
