# ============================================================================
# YSH Data Pipeline - Redis Cache Schema & Configuration
# ============================================================================
# Version: 1.0.0
# Date: October 14, 2025
# Purpose: Redis data structures, TTL strategies, and Lua scripts
# Database: Redis 7+
# Performance: Optimized for sub-millisecond reads with intelligent caching
# ============================================================================

# ============================================================================
# SECTION 1: KEY NAMING CONVENTIONS
# ============================================================================

"""
Key Pattern Conventions:
-------------------------
ysh:api:datasets:{id}               - Single dataset cache
ysh:api:search:{hash}                - Search results cache
ysh:api:products:{sku}               - Product cache
ysh:api:kits:{kit_id}                - Kit cache
ysh:last_ingestion                   - Last ingestion metadata
ysh:dataset_count                    - Total dataset count
ysh:status:{service}                 - Service health status
ysh:rate_limit:{ip}:{endpoint}       - Rate limiting counters
ysh:session:{session_id}             - User session data
ysh:lock:{resource}                  - Distributed locks
ysh:queue:{workflow}                 - Job queues
ysh:geo:{region}:units               - Geospatial generation units

TTL Strategies:
---------------
Hot data (API responses):    5 minutes (300s)
Search results:              1 hour (3600s)
Dataset metadata:            6 hours (21600s)
Product catalog:             12 hours (43200s)
Rate limit counters:         1 minute (60s)
Sessions:                    24 hours (86400s)
Health checks:               30 seconds (30s)
Distributed locks:           30 seconds (30s)
"""

# ============================================================================
# SECTION 2: REDIS CONFIGURATION
# ============================================================================

REDIS_CONFIG = """
# Redis Configuration for YSH Pipeline
# Save to: /etc/redis/redis.conf

# Network
bind 0.0.0.0
port 6379
protected-mode yes
requirepass CHANGE_ME_STRONG_PASSWORD

# Persistence
save 900 1        # Save if 1 key changed in 900 seconds
save 300 10       # Save if 10 keys changed in 300 seconds
save 60 10000     # Save if 10000 keys changed in 60 seconds
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis

# AOF (Append Only File)
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Memory Management
maxmemory 2gb
maxmemory-policy allkeys-lru  # Evict least recently used keys
maxmemory-samples 5

# Lazy Freeing
lazyfree-lazy-eviction yes
lazyfree-lazy-expire yes
lazyfree-lazy-server-del yes
replica-lazy-flush yes

# Performance
tcp-backlog 511
tcp-keepalive 300
timeout 0
databases 16

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Slow Log
slowlog-log-slower-than 10000  # 10ms
slowlog-max-len 128

# Replication (if using replicas)
# replicaof <master-ip> <master-port>
# masterauth <master-password>
"""

# ============================================================================
# SECTION 3: DATA STRUCTURES
# ============================================================================

REDIS_DATA_STRUCTURES = {
    # ------------------------------------------------------------------------
    # 3.1: STRING - Simple key-value pairs
    # ------------------------------------------------------------------------
    "strings": {
        "ysh:api:datasets:a1b2c3": {
            "type": "JSON string",
            "ttl": 21600,  # 6 hours
            "example": {
                "id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
                "title": "Unidades de Geração Distribuída - MG",
                "category": "geracao_distribuida",
                "modified": "2025-10-14T10:30:00Z",
                "url": "https://..."
            }
        },
        "ysh:last_ingestion": {
            "type": "JSON string",
            "ttl": 3600,  # 1 hour
            "example": {
                "run_id": "550e8400-e29b-41d4-a716-446655440000",
                "timestamp": "2025-10-14T02:00:00Z",
                "status": "SUCCESS",
                "duration_seconds": 1234
            }
        },
        "ysh:dataset_count": {
            "type": "Integer",
            "ttl": 3600,  # 1 hour
            "example": 15000
        }
    },
    
    # ------------------------------------------------------------------------
    # 3.2: HASH - Objects with multiple fields
    # ------------------------------------------------------------------------
    "hashes": {
        "ysh:api:products:FTV-PANEL-550-CS3W": {
            "type": "Hash",
            "ttl": 43200,  # 12 hours
            "fields": {
                "sku": "FTV-PANEL-550-CS3W",
                "name": "Painel Solar Canadian 550W CS3W-440P",
                "manufacturer": "Canadian Solar",
                "model": "CS3W-440P",
                "category": "paineis",
                "power_w": "550",
                "price": "1150.00",
                "stock": "120",
                "specifications": "{...json...}"
            }
        },
        "ysh:status:aneel_api": {
            "type": "Hash",
            "ttl": 30,  # 30 seconds
            "fields": {
                "status": "healthy",
                "last_check": "2025-10-14T12:00:00Z",
                "response_time_ms": "120",
                "error_count": "0"
            }
        }
    },
    
    # ------------------------------------------------------------------------
    # 3.3: LIST - Ordered collections
    # ------------------------------------------------------------------------
    "lists": {
        "ysh:queue:daily_ingestion": {
            "type": "List",
            "ttl": None,  # No expiration
            "description": "Job queue for daily ingestion tasks",
            "example": [
                '{"task_id": "1", "source": "DCAT_AP", "priority": 1}',
                '{"task_id": "2", "source": "RSS", "priority": 2}'
            ]
        },
        "ysh:recent_searches": {
            "type": "List (LTRIM to 100)",
            "ttl": 86400,  # 24 hours
            "description": "Recent search queries (max 100)",
            "example": [
                '{"query": "energia solar", "timestamp": 1729123456}',
                '{"query": "tarifa cemig", "timestamp": 1729123400}'
            ]
        }
    },
    
    # ------------------------------------------------------------------------
    # 3.4: SET - Unique unordered collections
    # ------------------------------------------------------------------------
    "sets": {
        "ysh:active_sessions": {
            "type": "Set",
            "ttl": None,
            "description": "Set of active session IDs",
            "example": [
                "sess_a1b2c3d4",
                "sess_x9y8z7w6"
            ]
        },
        "ysh:categories": {
            "type": "Set",
            "ttl": None,
            "description": "Set of all dataset categories",
            "example": [
                "geracao_distribuida",
                "tarifas",
                "certificacoes"
            ]
        }
    },
    
    # ------------------------------------------------------------------------
    # 3.5: SORTED SET - Ordered by score
    # ------------------------------------------------------------------------
    "sorted_sets": {
        "ysh:trending_products": {
            "type": "Sorted Set",
            "ttl": 3600,  # 1 hour
            "description": "Products sorted by popularity (score = view count)",
            "example": {
                "FTV-PANEL-550-CS3W": 1250,
                "FTV-PANEL-450-TRINA": 980,
                "INV-5KW-GROWATT": 850
            }
        },
        "ysh:api:leaderboard:states": {
            "type": "Sorted Set",
            "ttl": 21600,  # 6 hours
            "description": "States sorted by installed power",
            "example": {
                "BR-MG": 5000000,  # kW
                "BR-SP": 4500000,
                "BR-RS": 3200000
            }
        }
    },
    
    # ------------------------------------------------------------------------
    # 3.6: GEOSPATIAL - Location-based data
    # ------------------------------------------------------------------------
    "geospatial": {
        "ysh:geo:generation_units": {
            "type": "Geospatial",
            "ttl": 43200,  # 12 hours
            "description": "Generation units with lat/lon coordinates",
            "example": {
                "unit_12345": {"lon": -43.9345, "lat": -19.9208},
                "unit_67890": {"lon": -46.6333, "lat": -23.5505}
            }
        }
    },
    
    # ------------------------------------------------------------------------
    # 3.7: STREAM - Event logs
    # ------------------------------------------------------------------------
    "streams": {
        "ysh:events:ingestion": {
            "type": "Stream",
            "ttl": None,
            "description": "Stream of ingestion events",
            "maxlen": 10000,  # Keep last 10k events
            "example": [
                {"event": "ingestion_started", "run_id": "...", "timestamp": 1729123456},
                {"event": "datasets_fetched", "count": 150, "timestamp": 1729123500}
            ]
        }
    }
}

# ============================================================================
# SECTION 4: LUA SCRIPTS
# ============================================================================

LUA_SCRIPTS = {
    # ------------------------------------------------------------------------
    # 4.1: Cache with TTL and atomic operations
    # ------------------------------------------------------------------------
    "cache_set_with_ttl": """
-- Cache set with TTL
-- KEYS[1]: cache key
-- ARGV[1]: value (JSON)
-- ARGV[2]: TTL in seconds
-- ARGV[3]: hit count key
local key = KEYS[1]
local value = ARGV[1]
local ttl = tonumber(ARGV[2])
local hit_key = ARGV[3]

-- Set value with TTL
redis.call('SETEX', key, ttl, value)

-- Initialize hit counter
if hit_key then
    redis.call('SET', hit_key, 0, 'EX', ttl)
end

return 1
""",
    
    # ------------------------------------------------------------------------
    # 4.2: Get cached value and increment hit counter
    # ------------------------------------------------------------------------
    "cache_get_with_hit": """
-- Get cached value and increment hit counter
-- KEYS[1]: cache key
-- KEYS[2]: hit count key
local key = KEYS[1]
local hit_key = KEYS[2]

local value = redis.call('GET', key)
if value then
    -- Increment hit counter
    redis.call('INCR', hit_key)
    return {value, redis.call('GET', hit_key)}
end

return nil
""",
    
    # ------------------------------------------------------------------------
    # 4.3: Rate limiting (sliding window)
    # ------------------------------------------------------------------------
    "rate_limit_check": """
-- Rate limit check (sliding window)
-- KEYS[1]: rate limit key (e.g., ysh:rate_limit:192.168.1.1:/api/datasets)
-- ARGV[1]: max requests
-- ARGV[2]: window in seconds
local key = KEYS[1]
local max_requests = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local current_time = redis.call('TIME')
local current_timestamp = tonumber(current_time[1])

-- Remove old entries outside window
redis.call('ZREMRANGEBYSCORE', key, 0, current_timestamp - window)

-- Count requests in current window
local request_count = redis.call('ZCARD', key)

if request_count < max_requests then
    -- Add current request
    redis.call('ZADD', key, current_timestamp, current_timestamp)
    redis.call('EXPIRE', key, window)
    return {1, max_requests - request_count - 1}  -- allowed, remaining
else
    return {0, 0}  -- denied, 0 remaining
end
""",
    
    # ------------------------------------------------------------------------
    # 4.4: Distributed lock
    # ------------------------------------------------------------------------
    "acquire_lock": """
-- Acquire distributed lock
-- KEYS[1]: lock key
-- ARGV[1]: lock value (unique identifier)
-- ARGV[2]: TTL in seconds
local key = KEYS[1]
local value = ARGV[1]
local ttl = tonumber(ARGV[2])

-- Try to acquire lock
local result = redis.call('SET', key, value, 'NX', 'EX', ttl)
if result then
    return 1  -- Lock acquired
else
    return 0  -- Lock already held
end
""",
    
    # ------------------------------------------------------------------------
    # 4.5: Release lock safely
    # ------------------------------------------------------------------------
    "release_lock": """
-- Release distributed lock (only if we own it)
-- KEYS[1]: lock key
-- ARGV[1]: lock value (unique identifier)
local key = KEYS[1]
local value = ARGV[1]

-- Check if we own the lock
local current_value = redis.call('GET', key)
if current_value == value then
    redis.call('DEL', key)
    return 1  -- Lock released
else
    return 0  -- Lock not owned
end
""",
    
    # ------------------------------------------------------------------------
    # 4.6: Bulk cache invalidation by pattern
    # ------------------------------------------------------------------------
    "invalidate_pattern": """
-- Invalidate all keys matching pattern
-- KEYS[1]: pattern (e.g., ysh:api:datasets:*)
local pattern = KEYS[1]
local cursor = "0"
local count = 0

repeat
    local result = redis.call('SCAN', cursor, 'MATCH', pattern, 'COUNT', 100)
    cursor = result[1]
    local keys = result[2]
    
    if #keys > 0 then
        redis.call('DEL', unpack(keys))
        count = count + #keys
    end
until cursor == "0"

return count
"""
}

# ============================================================================
# SECTION 5: PYTHON CLIENT CONFIGURATION
# ============================================================================

PYTHON_CLIENT_CONFIG = """
import redis
from redis.sentinel import Sentinel
from typing import Any, Optional
import json
import hashlib

class YSHRedisClient:
    '''Redis client for YSH pipeline with built-in best practices.'''
    
    def __init__(
        self,
        host: str = 'localhost',
        port: int = 6379,
        password: Optional[str] = None,
        db: int = 0,
        decode_responses: bool = True,
        max_connections: int = 50,
        socket_timeout: int = 5,
        socket_connect_timeout: int = 5,
        retry_on_timeout: bool = True,
        health_check_interval: int = 30
    ):
        self.pool = redis.ConnectionPool(
            host=host,
            port=port,
            password=password,
            db=db,
            decode_responses=decode_responses,
            max_connections=max_connections,
            socket_timeout=socket_timeout,
            socket_connect_timeout=socket_connect_timeout,
            retry_on_timeout=retry_on_timeout,
            health_check_interval=health_check_interval
        )
        self.client = redis.Redis(connection_pool=self.pool)
        
        # Load Lua scripts
        self._load_scripts()
    
    def _load_scripts(self):
        '''Load Lua scripts into Redis.'''
        self.scripts = {
            'cache_set_with_ttl': self.client.register_script(
                LUA_SCRIPTS['cache_set_with_ttl']
            ),
            'cache_get_with_hit': self.client.register_script(
                LUA_SCRIPTS['cache_get_with_hit']
            ),
            'rate_limit_check': self.client.register_script(
                LUA_SCRIPTS['rate_limit_check']
            ),
            'acquire_lock': self.client.register_script(
                LUA_SCRIPTS['acquire_lock']
            ),
            'release_lock': self.client.register_script(
                LUA_SCRIPTS['release_lock']
            )
        }
    
    # ------------------------------------------------------------------------
    # Cache operations
    # ------------------------------------------------------------------------
    
    def cache_dataset(self, dataset_id: str, data: dict, ttl: int = 21600):
        '''Cache dataset with 6-hour TTL.'''
        key = f'ysh:api:datasets:{dataset_id}'
        return self.client.setex(key, ttl, json.dumps(data))
    
    def get_cached_dataset(self, dataset_id: str) -> Optional[dict]:
        '''Get cached dataset.'''
        key = f'ysh:api:datasets:{dataset_id}'
        data = self.client.get(key)
        return json.loads(data) if data else None
    
    def cache_search_results(
        self,
        query: str,
        filters: dict,
        results: list,
        ttl: int = 3600
    ):
        '''Cache search results with 1-hour TTL.'''
        # Generate cache key from query + filters
        cache_input = f"{query}:{json.dumps(filters, sort_keys=True)}"
        cache_key = hashlib.md5(cache_input.encode()).hexdigest()
        
        key = f'ysh:api:search:{cache_key}'
        data = {
            'query': query,
            'filters': filters,
            'results': results,
            'cached_at': self.client.time()[0]
        }
        return self.client.setex(key, ttl, json.dumps(data))
    
    def get_cached_search(
        self,
        query: str,
        filters: dict
    ) -> Optional[dict]:
        '''Get cached search results.'''
        cache_input = f"{query}:{json.dumps(filters, sort_keys=True)}"
        cache_key = hashlib.md5(cache_input.encode()).hexdigest()
        
        key = f'ysh:api:search:{cache_key}'
        data = self.client.get(key)
        return json.loads(data) if data else None
    
    # ------------------------------------------------------------------------
    # Rate limiting
    # ------------------------------------------------------------------------
    
    def check_rate_limit(
        self,
        identifier: str,
        endpoint: str,
        max_requests: int = 60,
        window: int = 60
    ) -> tuple[bool, int]:
        '''
        Check rate limit.
        
        Returns:
            (allowed: bool, remaining: int)
        '''
        key = f'ysh:rate_limit:{identifier}:{endpoint}'
        result = self.scripts['rate_limit_check'](
            keys=[key],
            args=[max_requests, window]
        )
        return bool(result[0]), result[1]
    
    # ------------------------------------------------------------------------
    # Distributed locks
    # ------------------------------------------------------------------------
    
    def acquire_lock(
        self,
        resource: str,
        lock_id: str,
        ttl: int = 30
    ) -> bool:
        '''Acquire distributed lock.'''
        key = f'ysh:lock:{resource}'
        result = self.scripts['acquire_lock'](
            keys=[key],
            args=[lock_id, ttl]
        )
        return bool(result)
    
    def release_lock(self, resource: str, lock_id: str) -> bool:
        '''Release distributed lock.'''
        key = f'ysh:lock:{resource}'
        result = self.scripts['release_lock'](
            keys=[key],
            args=[lock_id]
        )
        return bool(result)
    
    # ------------------------------------------------------------------------
    # Health checks
    # ------------------------------------------------------------------------
    
    def set_service_health(
        self,
        service: str,
        status: str,
        metadata: dict
    ):
        '''Set service health status.'''
        key = f'ysh:status:{service}'
        data = {
            'status': status,
            'metadata': metadata,
            'updated_at': self.client.time()[0]
        }
        return self.client.setex(key, 30, json.dumps(data))
    
    def get_service_health(self, service: str) -> Optional[dict]:
        '''Get service health status.'''
        key = f'ysh:status:{service}'
        data = self.client.get(key)
        return json.loads(data) if data else None
    
    # ------------------------------------------------------------------------
    # Statistics
    # ------------------------------------------------------------------------
    
    def increment_counter(self, counter: str, by: int = 1):
        '''Increment counter.'''
        key = f'ysh:counter:{counter}'
        return self.client.incrby(key, by)
    
    def get_counter(self, counter: str) -> int:
        '''Get counter value.'''
        key = f'ysh:counter:{counter}'
        value = self.client.get(key)
        return int(value) if value else 0

# Usage example
if __name__ == '__main__':
    redis_client = YSHRedisClient(
        host='localhost',
        port=6379,
        password='your_password_here'
    )
    
    # Cache a dataset
    redis_client.cache_dataset(
        'a1b2c3d4e5f6g7h8',
        {'title': 'Test Dataset', 'category': 'geracao_distribuida'}
    )
    
    # Get cached dataset
    dataset = redis_client.get_cached_dataset('a1b2c3d4e5f6g7h8')
    print(dataset)
    
    # Check rate limit
    allowed, remaining = redis_client.check_rate_limit(
        '192.168.1.1',
        '/api/datasets',
        max_requests=60,
        window=60
    )
    print(f"Rate limit: allowed={allowed}, remaining={remaining}")
"""

# ============================================================================
# SECTION 6: MONITORING & MAINTENANCE
# ============================================================================

MONITORING_COMMANDS = """
# ============================================================================
# Redis Monitoring Commands
# ============================================================================

# Get info
redis-cli INFO

# Check memory usage
redis-cli INFO memory

# Check connected clients
redis-cli INFO clients

# Monitor commands in real-time
redis-cli MONITOR

# Check slow queries
redis-cli SLOWLOG GET 10

# Check key distribution
redis-cli --scan --pattern 'ysh:*' | wc -l

# Check memory usage by key pattern
redis-cli --memkeys --pattern 'ysh:api:*'

# Get largest keys
redis-cli --bigkeys

# Check hit/miss ratio
redis-cli INFO stats | grep keyspace

# Flush specific database (CAUTION!)
redis-cli -n 0 FLUSHDB

# Save snapshot
redis-cli BGSAVE

# Check replication status
redis-cli INFO replication
"""

# ============================================================================
# END OF SCHEMA
# ============================================================================

print("Redis schema loaded successfully!")
print(f"Defined {len(LUA_SCRIPTS)} Lua scripts")
print(f"Defined {len(REDIS_DATA_STRUCTURES)} data structure categories")
