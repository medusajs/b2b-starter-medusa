"""
Fallback Products API - FastAPI (Python)
High-performance fallback API for product catalog with image synchronization

Endpoints:
- GET /api/v1/products
- GET /api/v1/products/{category}
- GET /api/v1/products/{category}/{product_id}
- GET /api/v1/health

Run: uvicorn fallback_api:app --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import os
from pathlib import Path
from datetime import datetime

# Initialize FastAPI app
app = FastAPI(
    title="YSH Solar Fallback API",
    description="High-performance fallback product catalog API with image synchronization",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BASE_DIR = Path(__file__).parent
FALLBACK_DATA_PATH = BASE_DIR / "data" / "catalog" / "fallback_exports"
MASTER_JSON_PATH = FALLBACK_DATA_PATH / "products_master.json"

# Cache
_master_data_cache: Optional[Dict[str, Any]] = None
_category_data_cache: Dict[str, Dict[str, Any]] = {}


# Models
class Product(BaseModel):
    id: str
    sku: Optional[str]
    name: str
    manufacturer: str
    model: Optional[str]
    category: str
    price_brl: float
    image_path: Optional[str]
    image_verified: bool
    technical_specs: Optional[Dict[str, Any]]
    description: Optional[str]
    availability: bool
    source: Optional[str]


class PaginatedResponse(BaseModel):
    success: bool = True
    data: List[Product]
    meta: Dict[str, Any]


class ProductResponse(BaseModel):
    success: bool = True
    data: Dict[str, Any]


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    uptime_seconds: int
    services: Dict[str, Any]


# Helper functions
def load_master_data() -> Optional[Dict[str, Any]]:
    """Load master product data"""
    global _master_data_cache
    
    if _master_data_cache:
        return _master_data_cache
    
    try:
        if MASTER_JSON_PATH.exists():
            with open(MASTER_JSON_PATH, 'r', encoding='utf-8') as f:
                _master_data_cache = json.load(f)
                return _master_data_cache
    except Exception as e:
        print(f"[Fallback API] Error loading master data: {e}")
    
    return None


def load_category_data(category: str) -> Optional[Dict[str, Any]]:
    """Load category-specific data"""
    if category in _category_data_cache:
        return _category_data_cache[category]
    
    try:
        category_path = FALLBACK_DATA_PATH / f"{category}.json"
        if category_path.exists():
            with open(category_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                _category_data_cache[category] = data
                return data
    except Exception as e:
        print(f"[Fallback API] Error loading category {category}: {e}")
    
    return None


def filter_products(products: List[Dict], search: Optional[str] = None, 
                   manufacturer: Optional[str] = None) -> List[Dict]:
    """Filter products by search term and manufacturer"""
    filtered = products
    
    if manufacturer:
        filtered = [
            p for p in filtered 
            if p.get('manufacturer', '').lower() == manufacturer.lower()
        ]
    
    if search:
        search_term = search.lower()
        filtered = [
            p for p in filtered
            if search_term in p.get('name', '').lower() or
               search_term in p.get('manufacturer', '').lower() or
               search_term in p.get('description', '').lower()
        ]
    
    return filtered


def paginate(items: List[Any], limit: int, offset: int) -> Dict[str, Any]:
    """Paginate items"""
    paginated_items = items[offset:offset + limit]
    
    return {
        "items": paginated_items,
        "meta": {
            "limit": limit,
            "offset": offset,
            "count": len(paginated_items),
            "total": len(items)
        }
    }


# Routes
@app.get("/api/v1/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    master_data = load_master_data()
    
    return {
        "status": "healthy" if master_data else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "uptime_seconds": 0,  # Would need startup tracking
        "services": {
            "fallback_data": {
                "status": "up" if master_data else "down",
                "total_products": master_data.get("total_products", 0) if master_data else 0,
                "with_images": master_data.get("with_images", 0) if master_data else 0,
                "image_coverage": master_data.get("image_coverage_percent", "0") if master_data else "0"
            }
        }
    }


@app.get("/api/v1/products", response_model=PaginatedResponse)
async def get_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    q: Optional[str] = Query(None, description="Search term"),
    manufacturer: Optional[str] = Query(None, description="Filter by manufacturer"),
    limit: int = Query(50, ge=1, le=100, description="Results per page"),
    offset: int = Query(0, ge=0, description="Offset for pagination")
):
    """
    Get all products or filter by category
    """
    # Load category or master data
    if category:
        data = load_category_data(category)
        if not data:
            raise HTTPException(status_code=404, detail=f"Category '{category}' not found")
        products = data.get("products", [])
    else:
        master_data = load_master_data()
        if not master_data:
            raise HTTPException(status_code=503, detail="Fallback data not available")
        products = master_data.get("products", [])
    
    # Apply filters
    filtered_products = filter_products(products, search=q, manufacturer=manufacturer)
    
    # Paginate
    paginated = paginate(filtered_products, limit, offset)
    
    return {
        "success": True,
        "data": paginated["items"],
        "meta": paginated["meta"]
    }


@app.get("/api/v1/products/{category}", response_model=PaginatedResponse)
async def get_category_products(
    category: str,
    q: Optional[str] = Query(None, description="Search term"),
    manufacturer: Optional[str] = Query(None, description="Filter by manufacturer"),
    limit: int = Query(50, ge=1, le=100, description="Results per page"),
    offset: int = Query(0, ge=0, description="Offset for pagination")
):
    """
    Get products for a specific category
    """
    data = load_category_data(category)
    
    if not data:
        raise HTTPException(status_code=404, detail=f"Category '{category}' not found")
    
    products = data.get("products", [])
    
    # Apply filters
    filtered_products = filter_products(products, search=q, manufacturer=manufacturer)
    
    # Paginate
    paginated = paginate(filtered_products, limit, offset)
    
    return {
        "success": True,
        "data": paginated["items"],
        "meta": {
            **paginated["meta"],
            "category": category,
            "total_category_products": data.get("total_products", 0),
            "with_images": data.get("with_images", 0)
        }
    }


@app.get("/api/v1/products/{category}/{product_id}", response_model=ProductResponse)
async def get_product_by_id(
    category: str,
    product_id: str
):
    """
    Get a single product by ID or SKU
    """
    data = load_category_data(category)
    
    if not data:
        raise HTTPException(status_code=404, detail=f"Category '{category}' not found")
    
    products = data.get("products", [])
    
    # Find product by ID or SKU
    product = next(
        (p for p in products if p.get("id") == product_id or p.get("sku") == product_id),
        None
    )
    
    if not product:
        raise HTTPException(
            status_code=404, 
            detail=f"Product '{product_id}' not found in category '{category}'"
        )
    
    return {
        "success": True,
        "data": {"product": product}
    }


@app.get("/api/v1/categories")
async def get_categories():
    """
    Get list of available categories
    """
    master_data = load_master_data()
    
    if not master_data:
        raise HTTPException(status_code=503, detail="Fallback data not available")
    
    categories = master_data.get("categories", [])
    
    # Get stats for each category
    category_stats = []
    for cat in categories:
        cat_data = load_category_data(cat)
        if cat_data:
            category_stats.append({
                "name": cat,
                "total_products": cat_data.get("total_products", 0),
                "with_images": cat_data.get("with_images", 0)
            })
    
    return {
        "success": True,
        "data": {
            "categories": category_stats,
            "total": len(category_stats)
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
