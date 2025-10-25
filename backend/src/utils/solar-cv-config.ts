/**
 * 🚀 YSH Solar AI Services - Configuration & Environment
 */

// ============================================================================
// Service URLs
// ============================================================================

export const SOLAR_CV_SERVICES = {
    PANEL_SEGMENTATION: {
        url: process.env.PANEL_SEGMENTATION_SERVICE_URL || "http://localhost:8001",
        apiKey: process.env.PANEL_SEGMENTATION_API_KEY || "",
        timeout: 30000,
    },
    PV_HAWK: {
        url: process.env.PV_HAWK_SERVICE_URL || "http://localhost:8002",
        apiKey: process.env.PV_HAWK_API_KEY || "",
        timeout: 120000,
    },
    OPEN_DRONE_MAP: {
        url: process.env.ODM_SERVICE_URL || "http://localhost:8003",
        apiKey: process.env.ODM_API_KEY || "",
        timeout: 600000,
    },
    ROOF_ANALYSIS: {
        url: process.env.ROOF_ANALYSIS_SERVICE_URL || "http://localhost:8004",
        apiKey: process.env.ROOF_ANALYSIS_API_KEY || "",
        timeout: 30000,
    },
} as const;

// ============================================================================
// Cache Configuration
// ============================================================================

export const CACHE_CONFIG = {
    PANEL_DETECTION: {
        ttl: 3600000, // 1 hour
        maxSize: 1000,
    },
    THERMAL_ANALYSIS: {
        ttl: 7200000, // 2 hours
        maxSize: 500,
    },
    PHOTOGRAMMETRY: {
        ttl: 86400000, // 24 hours
        maxSize: 100,
    },
} as const;

// ============================================================================
// Processing Limits
// ============================================================================

export const PROCESSING_LIMITS = {
    MAX_IMAGE_SIZE_MB: 50,
    MAX_VIDEO_SIZE_MB: 500,
    MAX_IMAGES_PER_REQUEST: 500,
    MAX_CONCURRENT_JOBS: 10,
    MIN_IMAGES_FOR_3D: 5,
} as const;

// ============================================================================
// Default Parameters
// ============================================================================

export const DEFAULT_PARAMS = {
    DETECTION: {
        zoom: 20,
        imagery_source: "google" as const,
        confidence_threshold: 0.70,
    },
    THERMAL: {
        temperature_threshold_c: 75,
        confidence_threshold: 0.80,
    },
    PHOTOGRAMMETRY: {
        gsd_cm: 2.0,
        min_num_features: 10000,
    },
} as const;

// ============================================================================
// Solar Constants
// ============================================================================

export const SOLAR_CONSTANTS = {
    // Average module size (m²)
    AVG_MODULE_AREA_M2: 2.0,

    // Average module power (W)
    AVG_MODULE_POWER_W: 550,

    // Typical system losses (%)
    TYPICAL_SYSTEM_LOSSES_PCT: 15,

    // Standard test conditions (W/m²)
    STC_IRRADIANCE: 1000,

    // Average Performance Ratio
    AVG_PERFORMANCE_RATIO: 0.80,

    // Module degradation per year (%)
    ANNUAL_DEGRADATION_PCT: 0.5,
} as const;

// ============================================================================
// Error Codes
// ============================================================================

export const ERROR_CODES = {
    // Input validation
    INVALID_COORDINATES: "E001",
    INVALID_IMAGE_FORMAT: "E002",
    IMAGE_TOO_LARGE: "E003",
    TOO_MANY_IMAGES: "E004",

    // Service errors
    SERVICE_UNAVAILABLE: "E101",
    SERVICE_TIMEOUT: "E102",
    PROCESSING_FAILED: "E103",

    // Resource errors
    RATE_LIMIT_EXCEEDED: "E201",
    QUOTA_EXCEEDED: "E202",
    STORAGE_FULL: "E203",

    // Data errors
    NO_PANELS_DETECTED: "W301",
    LOW_CONFIDENCE: "W302",
    INSUFFICIENT_DATA: "W303",
} as const;

// ============================================================================
// Model Versions
// ============================================================================

export const MODEL_VERSIONS = {
    PANEL_SEGMENTATION: "nrel-panel-seg-v2.1",
    PV_HAWK: "pv-hawk-v1.2",
    ODM: "odm-3.5.2",
    ROOF_EXTRACTION: "roof-detect-v1.0",
} as const;

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURE_FLAGS = {
    ENABLE_CACHING: process.env.ENABLE_CV_CACHING !== "false",
    ENABLE_ASYNC_PROCESSING: process.env.ENABLE_ASYNC_CV !== "false",
    ENABLE_WEBHOOKS: process.env.ENABLE_CV_WEBHOOKS === "true",
    ENABLE_RATE_LIMITING: process.env.ENABLE_CV_RATE_LIMIT !== "false",
} as const;

// ============================================================================
// Logging Configuration
// ============================================================================

export const LOGGING_CONFIG = {
    LEVEL: process.env.CV_LOG_LEVEL || "info",
    INCLUDE_METRICS: process.env.CV_LOG_METRICS === "true",
    REDACT_COORDINATES: process.env.CV_REDACT_COORDS === "true",
} as const;
