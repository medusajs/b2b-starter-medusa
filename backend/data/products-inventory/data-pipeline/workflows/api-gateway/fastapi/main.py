"""
YSH Data Pipeline API Gateway
FastAPI REST API for accessing processed data
"""

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import boto3
import json
import redis
import os

# FastAPI app
app = FastAPI(
    title="YSH Data Pipeline API",
    description="API Gateway para dados brasileiros de energia solar",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AWS Clients
dynamodb = boto3.resource('dynamodb')
s3_client = boto3.client('s3')

# Redis client
redis_client = redis.Redis(
    host=os.environ.get('REDIS_HOST', 'ysh-redis-cache'),
    port=int(os.environ.get('REDIS_PORT', 6379)),
    decode_responses=True
)

# Configuration
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE', 'ysh-pipeline-cache')
S3_BUCKET = os.environ.get('S3_BUCKET', 'ysh-pipeline-data')


# =============== Models ===============

class Dataset(BaseModel):
    """Dataset model"""
    id: str
    title: str
    description: Optional[str] = None
    published: Optional[str] = None
    source: str
    ai_metadata: Optional[Dict[str, Any]] = None


class SearchRequest(BaseModel):
    """Search request model"""
    query: str = Field(..., min_length=3, max_length=200)
    limit: int = Field(10, ge=1, le=100)
    category: Optional[str] = None


class SearchResponse(BaseModel):
    """Search response model"""
    query: str
    results: List[Dataset]
    count: int
    timestamp: str


class IngestionStatus(BaseModel):
    """Ingestion status model"""
    last_run: str
    datasets_count: int
    status: str
    next_run: Optional[str] = None


# =============== Dependencies ===============

async def get_cached_data(key: str) -> Optional[Dict]:
    """Get data from Redis cache"""
    try:
        data = redis_client.get(key)
        if data:
            return json.loads(data)
    except Exception as e:
        print(f"Cache error: {e}")
    return None


async def set_cached_data(key: str, data: Dict, ttl: int = 3600) -> None:
    """Set data in Redis cache"""
    try:
        redis_client.setex(
            key,
            ttl,
            json.dumps(data, ensure_ascii=False)
        )
    except Exception as e:
        print(f"Cache error: {e}")


# =============== Routes ===============

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "YSH Data Pipeline API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "datasets": "/api/v1/datasets",
            "search": "/api/v1/search",
            "status": "/api/v1/status",
            "docs": "/api/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    
    # Check Redis
    try:
        redis_client.ping()
        redis_status = "healthy"
    except:
        redis_status = "unhealthy"
    
    # Check DynamoDB
    try:
        table = dynamodb.Table(DYNAMODB_TABLE)
        table.table_status
        dynamodb_status = "healthy"
    except:
        dynamodb_status = "unhealthy"
    
    overall_status = "healthy" if all([
        redis_status == "healthy",
        dynamodb_status == "healthy"
    ]) else "degraded"
    
    return {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "redis": redis_status,
            "dynamodb": dynamodb_status
        }
    }


@app.get("/api/v1/datasets", response_model=List[Dataset])
async def get_datasets(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    source: Optional[str] = Query(None),
    category: Optional[str] = Query(None)
):
    """
    Get datasets from latest ingestion
    
    - **limit**: Number of results (1-100)
    - **offset**: Pagination offset
    - **source**: Filter by source (aneel, cpfl, enel, etc)
    - **category**: Filter by AI-generated category
    """
    
    # Try cache first
    cache_key = f"datasets:{limit}:{offset}:{source}:{category}"
    cached = await get_cached_data(cache_key)
    if cached:
        return cached
    
    try:
        # Get from DynamoDB
        table = dynamodb.Table(DYNAMODB_TABLE)
        response = table.get_item(
            Key={'pk': 'latest', 'sk': 'ingestion'}
        )
        
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="No data available")
        
        data = json.loads(response['Item']['data'])
        datasets = data.get('datasets', [])
        
        # Apply filters
        if source:
            datasets = [d for d in datasets if d.get('source') == source]
        
        if category:
            datasets = [
                d for d in datasets
                if d.get('ai_metadata', {}).get('categoria') == category
            ]
        
        # Pagination
        total = len(datasets)
        datasets = datasets[offset:offset+limit]
        
        # Cache result
        await set_cached_data(cache_key, datasets, ttl=300)
        
        return datasets
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/search", response_model=SearchResponse)
async def search_datasets(request: SearchRequest):
    """
    Search datasets by query
    
    Uses semantic search with vector embeddings
    """
    
    # Try cache first
    cache_key = f"search:{request.query}:{request.limit}:{request.category}"
    cached = await get_cached_data(cache_key)
    if cached:
        return cached
    
    try:
        # Get all datasets
        table = dynamodb.Table(DYNAMODB_TABLE)
        response = table.get_item(
            Key={'pk': 'latest', 'sk': 'ingestion'}
        )
        
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="No data available")
        
        data = json.loads(response['Item']['data'])
        datasets = data.get('datasets', [])
        
        # Simple text search (in production: use Qdrant vector search)
        query_lower = request.query.lower()
        results = []
        
        for dataset in datasets:
            title = dataset.get('title', '').lower()
            description = dataset.get('description', '').lower()
            
            # Check if query in title or description
            if query_lower in title or query_lower in description:
                # Apply category filter
                if request.category:
                    category = dataset.get('ai_metadata', {}).get('categoria', '')
                    if category != request.category:
                        continue
                
                results.append(dataset)
            
            if len(results) >= request.limit:
                break
        
        response_data = {
            'query': request.query,
            'results': results,
            'count': len(results),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Cache result
        await set_cached_data(cache_key, response_data, ttl=300)
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/status", response_model=IngestionStatus)
async def get_status():
    """
    Get pipeline ingestion status
    
    Returns last run time, dataset count, and next scheduled run
    """
    
    try:
        # Get from DynamoDB
        table = dynamodb.Table(DYNAMODB_TABLE)
        response = table.get_item(
            Key={'pk': 'latest', 'sk': 'ingestion'}
        )
        
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="No data available")
        
        item = response['Item']
        
        # Calculate next run (daily at 2 AM)
        last_run = datetime.fromisoformat(item['timestamp'])
        next_run = last_run.replace(hour=2, minute=0, second=0, microsecond=0)
        if next_run <= datetime.utcnow():
            next_run += timedelta(days=1)
        
        return {
            'last_run': item['timestamp'],
            'datasets_count': item.get('count', 0),
            'status': 'operational',
            'next_run': next_run.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ingest")
async def trigger_ingestion():
    """
    Trigger manual data ingestion
    
    Requires admin authentication (add JWT middleware in production)
    """
    
    # In production: check JWT token
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Trigger Step Functions workflow
        stepfunctions_client = boto3.client('stepfunctions')
        
        response = stepfunctions_client.start_execution(
            stateMachineArn=os.environ.get(
                'STATE_MACHINE_ARN',
                'arn:aws:states:us-east-1:123456789012:stateMachine:ysh-ingestion-workflow'
            ),
            input=json.dumps({
                'action': 'fetch_all',
                'include_rss': True,
                'triggered_by': 'api'
            })
        )
        
        return {
            'status': 'triggered',
            'execution_arn': response['executionArn'],
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============== WebSocket (optional) ===============

from fastapi import WebSocket, WebSocketDisconnect

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates
    
    Clients connect and receive live pipeline notifications
    """
    await websocket.accept()
    
    try:
        # Subscribe to Redis pub/sub
        pubsub = redis_client.pubsub()
        pubsub.subscribe('pipeline:updates')
        
        # Send initial status
        await websocket.send_json({
            'type': 'connected',
            'timestamp': datetime.utcnow().isoformat()
        })
        
        # Listen for updates
        for message in pubsub.listen():
            if message['type'] == 'message':
                data = json.loads(message['data'])
                await websocket.send_json(data)
                
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        pubsub.unsubscribe()
        pubsub.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
