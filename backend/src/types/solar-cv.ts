/**
 * 🌍 YSH Solar Computer Vision - Type Definitions
 * Shared types for all CV APIs
 */

// ============================================================================
// GeoJSON Types (Simplified)
// ============================================================================

export namespace GeoJSON {
    export type Position = [number, number] | [number, number, number];

    export interface Geometry {
        type: string;
    }

    export interface Polygon extends Geometry {
        type: "Polygon";
        coordinates: Position[][];
    }

    export interface Point extends Geometry {
        type: "Point";
        coordinates: Position;
    }

    export interface LineString extends Geometry {
        type: "LineString";
        coordinates: Position[];
    }

    export interface Feature<G extends Geometry = Geometry, P = any> {
        type: "Feature";
        geometry: G;
        properties: P;
    }

    export interface FeatureCollection<G extends Geometry = Geometry, P = any> {
        type: "FeatureCollection";
        features: Feature<G, P>[];
    }
}

// ============================================================================
// Common Response Types
// ============================================================================

export interface ServiceHealth {
    service: string;
    version: string;
    status: "operational" | "degraded" | "down";
    uptime_seconds?: number;
    last_health_check?: string;
}

export interface ProcessingMetrics {
    duration_ms: number;
    cpu_usage_pct?: number;
    memory_mb?: number;
    model_version: string;
}

export interface ErrorResponse {
    success: false;
    error: string;
    error_code?: string;
    details?: any;
    timestamp: string;
}

// ============================================================================
// Location & Geography
// ============================================================================

export interface Coordinates {
    latitude: number;
    longitude: number;
    elevation_m?: number;
}

export interface BoundingBox {
    north: number;
    south: number;
    east: number;
    west: number;
}

export interface Address {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
}

// ============================================================================
// Solar Panel Types
// ============================================================================

export type PanelTechnology =
    | "mono_perc"
    | "poly"
    | "topcon"
    | "hjt"
    | "cigs"
    | "cdte";

export type MountingType =
    | "rooftop_flat"
    | "rooftop_tilted"
    | "ground_fixed"
    | "ground_tracker"
    | "carport"
    | "facade";

export interface PanelSpecification {
    manufacturer: string;
    model: string;
    power_w: number;
    efficiency_pct: number;
    technology: PanelTechnology;
    dimensions_mm: {
        length: number;
        width: number;
        thickness: number;
    };
    weight_kg: number;
    temperature_coefficient_pct_per_c: number;
}

// ============================================================================
// Detection Confidence Levels
// ============================================================================

export type ConfidenceLevel =
    | "very_high" // > 95%
    | "high"      // 85-95%
    | "medium"    // 70-85%
    | "low"       // 50-70%
    | "very_low"; // < 50%

export function getConfidenceLevel(score: number): ConfidenceLevel {
    if (score >= 0.95) return "very_high";
    if (score >= 0.85) return "high";
    if (score >= 0.70) return "medium";
    if (score >= 0.50) return "low";
    return "very_low";
}

// ============================================================================
// Imagery Types
// ============================================================================

export interface ImageryMetadata {
    source: string;
    resolution_cm: number;
    capture_date?: string;
    sensor_type?: "rgb" | "multispectral" | "thermal" | "lidar";
    bands?: string[];
}

export interface ImageBounds {
    bbox: BoundingBox;
    center: Coordinates;
    zoom_level: number;
}

// ============================================================================
// Job Queue & Async Processing
// ============================================================================

export interface JobStatus {
    job_id: string;
    status: "queued" | "processing" | "completed" | "failed";
    progress_pct: number;
    eta_seconds?: number;
    created_at: string;
    updated_at: string;
    result_url?: string;
    error?: string;
}

export interface AsyncJobResponse {
    success: true;
    job_id: string;
    status_url: string;
    estimated_duration_seconds: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

export function calculateDistance(
    coord1: Coordinates,
    coord2: Coordinates
): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

export function calculatePolygonArea(coordinates: GeoJSON.Position[]): number {
    // Shoelace formula for polygon area
    let area = 0;
    const n = coordinates.length;

    for (let i = 0; i < n - 1; i++) {
        area += coordinates[i][0] * coordinates[i + 1][1];
        area -= coordinates[i + 1][0] * coordinates[i][1];
    }

    return Math.abs(area) / 2;
}

// ============================================================================
// API Rate Limiting
// ============================================================================

export interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset_at: string;
}

export interface RateLimitedResponse extends ServiceHealth {
    rate_limit: RateLimitInfo;
}

// ============================================================================
// Webhooks & Notifications
// ============================================================================

export interface WebhookConfig {
    url: string;
    events: string[];
    headers?: Record<string, string>;
}

export interface WebhookPayload<T = any> {
    event: string;
    timestamp: string;
    data: T;
}
