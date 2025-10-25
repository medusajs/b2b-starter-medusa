# 🌞 YSH Solar Computer Vision APIs

High-performance TypeScript APIs integrating FOSS solutions for solar panel detection, thermal analysis, and 3D reconstruction.

## 📡 Deployed Endpoints

### 1. **Solar Detection API**

`POST /store/solar-detection`

Detects solar panels from satellite imagery using NREL Panel-Segmentation.

**Request:**

```json
{
  "latitude": -23.550520,
  "longitude": -46.633308,
  "address": "São Paulo, SP",
  "zoom": 20,
  "imagery_source": "google",
  "detect_orientation": true,
  "detect_mounting": true,
  "estimate_capacity": true
}
```

**Response:**

```json
{
  "success": true,
  "location": {
    "latitude": -23.550520,
    "longitude": -46.633308,
    "address": "São Paulo, SP"
  },
  "detection": {
    "panels_detected": 42,
    "total_area_m2": 254.8,
    "estimated_capacity_kwp": 57.6,
    "average_confidence": 0.94
  },
  "panels": [...],
  "processing": {
    "duration_ms": 3420,
    "model_version": "nrel-panel-seg-v2.1"
  }
}
```

---

### 2. **Thermal Analysis API**

`POST /store/thermal-analysis`

Analyzes thermal imagery for defect detection using PV-Hawk.

**Request:**

```json
{
  "video_url": "https://storage.ysh/thermal-inspection.mp4",
  "imagery_type": "thermal_ir",
  "plant_id": "usina-abc-123",
  "detect_hotspots": true,
  "detect_shading": true,
  "detect_soiling": true,
  "temperature_threshold_c": 75
}
```

**Response:**

```json
{
  "success": true,
  "plant_id": "usina-abc-123",
  "analysis": {
    "total_modules": 1200,
    "healthy_modules": 1165,
    "modules_with_anomalies": 35,
    "critical_issues": 8,
    "major_issues": 15,
    "minor_issues": 12
  },
  "anomalies": [
    {
      "id": "anom-001",
      "type": "hotspot",
      "severity": "critical",
      "confidence": 0.96,
      "module_id": "M-124",
      "temperature_max_c": 92.3,
      "affected_area_pct": 15.2
    }
  ],
  "thermal_map": {
    "url": "https://storage.ysh/thermal-map-123.tiff",
    "format": "geotiff",
    "max_temp_c": 92.3,
    "min_temp_c": 28.1,
    "avg_temp_c": 45.7
  }
}
```

---

### 3. **Photogrammetry API**

`POST /store/photogrammetry`

Generates 3D models from drone imagery using OpenDroneMap.

**Request:**

```json
{
  "images": [
    "https://storage.ysh/drone/img001.jpg",
    "https://storage.ysh/drone/img002.jpg"
  ],
  "project_name": "residencial-xyz-roof-survey",
  "output_types": ["orthophoto", "dsm", "point_cloud"],
  "gsd_cm": 2.0,
  "georeferencing": true,
  "fast_orthophoto": false
}
```

**Async Mode:**

```bash
POST /store/photogrammetry?async=true
```

**Response (Async):**

```json
{
  "success": true,
  "message": "Processing started",
  "project_id": "residencial-xyz-roof-survey",
  "status_url": "/store/photogrammetry?project_id=residencial-xyz-roof-survey"
}
```

**Response (Completed):**

```json
{
  "success": true,
  "project_name": "residencial-xyz-roof-survey",
  "outputs": {
    "orthophoto": {
      "url": "https://storage.ysh/ortho-123.tiff",
      "resolution_cm": 2.1,
      "format": "geotiff"
    },
    "dsm": {
      "url": "https://storage.ysh/dsm-123.tiff",
      "resolution_cm": 4.2,
      "format": "geotiff"
    },
    "point_cloud": {
      "url": "https://storage.ysh/cloud-123.laz",
      "format": "laz",
      "num_points": 15420890
    }
  },
  "measurements": {
    "total_area_m2": 180.5,
    "roofs_detected": [
      {
        "roof_id": "roof-001",
        "area_m2": 95.2,
        "avg_tilt_degrees": 18.5,
        "avg_azimuth_degrees": 180,
        "suitable_for_solar": true,
        "estimated_panel_capacity": 21
      }
    ]
  }
}
```

---

## 🔧 Environment Variables

Add to `.env`:

```bash
# Panel Segmentation Service (NREL)
PANEL_SEGMENTATION_SERVICE_URL=http://localhost:8001
PANEL_SEGMENTATION_API_KEY=your-api-key

# PV-Hawk Thermal Analysis
PV_HAWK_SERVICE_URL=http://localhost:8002
PV_HAWK_API_KEY=your-api-key

# OpenDroneMap
ODM_SERVICE_URL=http://localhost:8003
ODM_API_KEY=your-api-key

# Roof Analysis Service
ROOF_ANALYSIS_SERVICE_URL=http://localhost:8004

# API Configuration
SOLAR_CV_API_KEYS=key1,key2,key3
CV_CORS_ORIGINS=http://localhost:3000,https://ysh.solar

# Feature Flags
ENABLE_CV_CACHING=true
ENABLE_ASYNC_CV=true
ENABLE_CV_RATE_LIMIT=true
ENABLE_CV_WEBHOOKS=false

# Logging
CV_LOG_LEVEL=info
CV_LOG_METRICS=true
```

---

## 🚀 Performance Optimizations

### 1. **In-Memory Caching**

- Panel detection: 1h TTL, 1000 entries max
- Thermal analysis: 2h TTL, 500 entries max
- Photogrammetry: 24h TTL, 100 entries max

### 2. **Rate Limiting**

- Default: 100 requests/minute per IP
- Configurable via middleware

### 3. **Async Processing**

- Long-running photogrammetry jobs
- Background thermal video processing
- Status polling endpoints

### 4. **Connection Pooling**

- Persistent HTTP clients
- Timeout configurations per service
- Automatic retry with exponential backoff

### 5. **Response Streaming**

- Large file downloads
- Progressive result updates
- Chunked transfer encoding

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     YSH Medusa Backend                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              TypeScript API Layer                     │  │
│  │  - solar-detection/route.ts                          │  │
│  │  - thermal-analysis/route.ts                         │  │
│  │  - photogrammetry/route.ts                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Service Layer (Singleton)                    │  │
│  │  - PanelSegmentationService                          │  │
│  │  - PVHawkService                                     │  │
│  │  - OpenDroneMapService                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       Middleware (Rate Limit, Auth, Cache)           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Python Microservices                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Panel-Seg    │  │   PV-Hawk    │  │     ODM      │     │
│  │ (NREL)       │  │   (MIT)      │  │   (AGPL)     │     │
│  │ Port: 8001   │  │ Port: 8002   │  │ Port: 8003   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Metrics & Monitoring

All endpoints return processing metrics:

```json
{
  "processing": {
    "duration_ms": 3420,
    "model_version": "nrel-panel-seg-v2.1"
  }
}
```

Headers added:

- `X-Request-ID`: Unique request identifier
- `X-RateLimit-Limit`: Rate limit ceiling
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Rate limit reset time

---

## 🧪 Testing

```bash
# Test Panel Detection
curl -X POST http://localhost:9000/store/solar-detection \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "latitude": -23.550520,
    "longitude": -46.633308,
    "zoom": 20
  }'

# Test Thermal Analysis
curl -X POST http://localhost:9000/store/thermal-analysis \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "video_url": "https://example.com/thermal.mp4",
    "imagery_type": "thermal_ir"
  }'

# Test Photogrammetry (Async)
curl -X POST "http://localhost:9000/store/photogrammetry?async=true" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "images": ["img1.jpg", "img2.jpg"],
    "project_name": "test-project"
  }'

# Check Status
curl "http://localhost:9000/store/photogrammetry?project_id=test-project"
```

---

## 🎯 Next Steps

1. **Deploy Python Microservices**
   - Setup Panel-Segmentation container
   - Setup PV-Hawk container
   - Setup OpenDroneMap container

2. **Add Webhook Support**
   - Async job completion notifications
   - Error alerts
   - Performance metrics

3. **Enhance Hélio Agent**
   - Integrate CV APIs into viability.pv workflow
   - Add thermal inspection to om.monitor
   - Use photogrammetry for remote sizing

4. **Add Storage Integration**
   - S3/MinIO for large files
   - CDN for processed imagery
   - Cleanup policies

---

## 📚 References

- [Panel-Segmentation (NREL)](https://github.com/NREL/Panel-Segmentation)
- [PV-Hawk](https://github.com/jonathanventura/pv-hawk)
- [OpenDroneMap](https://github.com/OpenDroneMap/ODM)
- [YSH AGENTS.md](../../../storefront/AGENTS.md)
