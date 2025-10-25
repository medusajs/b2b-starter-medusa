"""
============================================================================
YSH Data Pipeline - DynamoDB Schema & Setup
============================================================================
Version: 1.0.0
Date: October 14, 2025
Purpose: AWS DynamoDB table definitions with CDK/CloudFormation templates
Database: AWS DynamoDB
Performance: Optimized for high-throughput reads/writes with TTL
============================================================================
"""

import boto3
from typing import Dict, List, Any

# ============================================================================
# SECTION 1: TABLE DEFINITIONS
# ============================================================================

DYNAMODB_TABLES = {
    # ------------------------------------------------------------------------
    # 1.1: Pipeline Cache Table (Main cache layer)
    # ------------------------------------------------------------------------
    "ysh-pipeline-cache": {
        "TableName": "ysh-pipeline-cache",
        "KeySchema": [
            {"AttributeName": "pk", "KeyType": "HASH"},   # Partition key
            {"AttributeName": "sk", "KeyType": "RANGE"}   # Sort key
        ],
        "AttributeDefinitions": [
            {"AttributeName": "pk", "AttributeType": "S"},
            {"AttributeName": "sk", "AttributeType": "S"},
            {"AttributeName": "source", "AttributeType": "S"},
            {"AttributeName": "category", "AttributeType": "S"},
            {"AttributeName": "timestamp", "AttributeType": "N"}
        ],
        "GlobalSecondaryIndexes": [
            {
                "IndexName": "SourceIndex",
                "KeySchema": [
                    {"AttributeName": "source", "KeyType": "HASH"},
                    {"AttributeName": "timestamp", "KeyType": "RANGE"}
                ],
                "Projection": {"ProjectionType": "ALL"},
                "ProvisionedThroughput": {
                    "ReadCapacityUnits": 5,
                    "WriteCapacityUnits": 5
                }
            },
            {
                "IndexName": "CategoryIndex",
                "KeySchema": [
                    {"AttributeName": "category", "KeyType": "HASH"},
                    {"AttributeName": "timestamp", "KeyType": "RANGE"}
                ],
                "Projection": {"ProjectionType": "ALL"},
                "ProvisionedThroughput": {
                    "ReadCapacityUnits": 5,
                    "WriteCapacityUnits": 5
                }
            }
        ],
        "BillingMode": "PAY_PER_REQUEST",  # On-demand pricing
        "StreamSpecification": {
            "StreamEnabled": True,
            "StreamViewType": "NEW_AND_OLD_IMAGES"
        },
        "TimeToLiveSpecification": {
            "Enabled": True,
            "AttributeName": "ttl"
        },
        "Tags": [
            {"Key": "Project", "Value": "YSH"},
            {"Key": "Environment", "Value": "Production"},
            {"Key": "Component", "Value": "Cache"}
        ]
    },
    
    # ------------------------------------------------------------------------
    # 1.2: Ingestion Metadata Table
    # ------------------------------------------------------------------------
    "ysh-ingestion-metadata": {
        "TableName": "ysh-ingestion-metadata",
        "KeySchema": [
            {"AttributeName": "run_id", "KeyType": "HASH"},
            {"AttributeName": "timestamp", "KeyType": "RANGE"}
        ],
        "AttributeDefinitions": [
            {"AttributeName": "run_id", "AttributeType": "S"},
            {"AttributeName": "timestamp", "AttributeType": "N"},
            {"AttributeName": "workflow_name", "AttributeType": "S"},
            {"AttributeName": "status", "AttributeType": "S"}
        ],
        "GlobalSecondaryIndexes": [
            {
                "IndexName": "WorkflowIndex",
                "KeySchema": [
                    {"AttributeName": "workflow_name", "KeyType": "HASH"},
                    {"AttributeName": "timestamp", "KeyType": "RANGE"}
                ],
                "Projection": {"ProjectionType": "ALL"},
                "ProvisionedThroughput": {
                    "ReadCapacityUnits": 5,
                    "WriteCapacityUnits": 5
                }
            },
            {
                "IndexName": "StatusIndex",
                "KeySchema": [
                    {"AttributeName": "status", "KeyType": "HASH"},
                    {"AttributeName": "timestamp", "KeyType": "RANGE"}
                ],
                "Projection": {"ProjectionType": "ALL"},
                "ProvisionedThroughput": {
                    "ReadCapacityUnits": 5,
                    "WriteCapacityUnits": 5
                }
            }
        ],
        "BillingMode": "PAY_PER_REQUEST",
        "StreamSpecification": {
            "StreamEnabled": True,
            "StreamViewType": "NEW_AND_OLD_IMAGES"
        },
        "TimeToLiveSpecification": {
            "Enabled": True,
            "AttributeName": "ttl"
        },
        "Tags": [
            {"Key": "Project", "Value": "YSH"},
            {"Key": "Environment", "Value": "Production"},
            {"Key": "Component", "Value": "Pipeline"}
        ]
    },
    
    # ------------------------------------------------------------------------
    # 1.3: API Request Cache Table
    # ------------------------------------------------------------------------
    "ysh-api-cache": {
        "TableName": "ysh-api-cache",
        "KeySchema": [
            {"AttributeName": "cache_key", "KeyType": "HASH"}
        ],
        "AttributeDefinitions": [
            {"AttributeName": "cache_key", "AttributeType": "S"},
            {"AttributeName": "endpoint", "AttributeType": "S"},
            {"AttributeName": "created_at", "AttributeType": "N"}
        ],
        "GlobalSecondaryIndexes": [
            {
                "IndexName": "EndpointIndex",
                "KeySchema": [
                    {"AttributeName": "endpoint", "KeyType": "HASH"},
                    {"AttributeName": "created_at", "KeyType": "RANGE"}
                ],
                "Projection": {"ProjectionType": "KEYS_ONLY"},
                "ProvisionedThroughput": {
                    "ReadCapacityUnits": 5,
                    "WriteCapacityUnits": 5
                }
            }
        ],
        "BillingMode": "PAY_PER_REQUEST",
        "TimeToLiveSpecification": {
            "Enabled": True,
            "AttributeName": "ttl"
        },
        "Tags": [
            {"Key": "Project", "Value": "YSH"},
            {"Key": "Environment", "Value": "Production"},
            {"Key": "Component", "Value": "API"}
        ]
    },
    
    # ------------------------------------------------------------------------
    # 1.4: Session Store Table (User sessions, WebSocket connections)
    # ------------------------------------------------------------------------
    "ysh-sessions": {
        "TableName": "ysh-sessions",
        "KeySchema": [
            {"AttributeName": "session_id", "KeyType": "HASH"}
        ],
        "AttributeDefinitions": [
            {"AttributeName": "session_id", "AttributeType": "S"},
            {"AttributeName": "user_id", "AttributeType": "S"},
            {"AttributeName": "created_at", "AttributeType": "N"}
        ],
        "GlobalSecondaryIndexes": [
            {
                "IndexName": "UserIndex",
                "KeySchema": [
                    {"AttributeName": "user_id", "KeyType": "HASH"},
                    {"AttributeName": "created_at", "KeyType": "RANGE"}
                ],
                "Projection": {"ProjectionType": "ALL"},
                "ProvisionedThroughput": {
                    "ReadCapacityUnits": 5,
                    "WriteCapacityUnits": 5
                }
            }
        ],
        "BillingMode": "PAY_PER_REQUEST",
        "TimeToLiveSpecification": {
            "Enabled": True,
            "AttributeName": "ttl"
        },
        "Tags": [
            {"Key": "Project", "Value": "YSH"},
            {"Key": "Environment", "Value": "Production"},
            {"Key": "Component", "Value": "Sessions"}
        ]
    }
}

# ============================================================================
# SECTION 2: ITEM SCHEMAS (Data patterns)
# ============================================================================

ITEM_SCHEMAS = {
    # ------------------------------------------------------------------------
    # 2.1: Pipeline Cache Items
    # ------------------------------------------------------------------------
    "pipeline_cache": {
        "latest_ingestion": {
            "pk": "latest",
            "sk": "ingestion",
            "timestamp": 1729123456,
            "run_id": "550e8400-e29b-41d4-a716-446655440000",
            "workflow_name": "daily_full_ingestion",
            "status": "SUCCESS",
            "datasets_fetched": 150,
            "datasets_processed": 148,
            "duration_seconds": 1234,
            "ttl": 1729209856  # 24 hours
        },
        "dataset_by_id": {
            "pk": "dataset",
            "sk": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
            "dataset_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
            "title": "Unidades de Geração Distribuída - MG",
            "category": "geracao_distribuida",
            "source": "DCAT_AP",
            "modified": "2025-10-14T10:30:00Z",
            "url": "https://dadosabertos-aneel.opendata.arcgis.com/datasets/...",
            "metadata": {
                "format": "CSV",
                "size_mb": 12.5,
                "records": 15000
            },
            "ttl": 1729123856  # 6 hours
        },
        "search_results": {
            "pk": "search",
            "sk": "md5:a1b2c3d4e5f6g7h8",  # MD5 of query params
            "query": "energia solar",
            "filters": {
                "category": "geracao_distribuida",
                "state": "BR-MG"
            },
            "results": [
                {"id": "...", "title": "...", "score": 0.95},
                {"id": "...", "title": "...", "score": 0.87}
            ],
            "result_count": 25,
            "timestamp": 1729123456,
            "ttl": 1729127056  # 1 hour
        },
        "fallback_data": {
            "pk": "fallback",
            "sk": "geracao_distribuida#BR-MG",
            "category": "geracao_distribuida",
            "state": "BR-MG",
            "source": "RSS",
            "data_snapshot": {
                "datasets": [...],
                "count": 10
            },
            "snapshot_age_hours": 4,
            "timestamp": 1729123456,
            "ttl": 1729727456  # 7 days
        }
    },
    
    # ------------------------------------------------------------------------
    # 2.2: Ingestion Metadata Items
    # ------------------------------------------------------------------------
    "ingestion_metadata": {
        "run_record": {
            "run_id": "550e8400-e29b-41d4-a716-446655440000",
            "timestamp": 1729123456,
            "workflow_name": "daily_full_ingestion",
            "trigger_type": "scheduled",
            "status": "SUCCESS",
            "started_at": "2025-10-14T02:00:00Z",
            "ended_at": "2025-10-14T02:20:34Z",
            "duration_seconds": 1234,
            "metrics": {
                "datasets_fetched": 150,
                "datasets_processed": 148,
                "datasets_inserted": 45,
                "datasets_updated": 103,
                "datasets_failed": 2,
                "api_calls": 25,
                "cache_hits": 120,
                "cache_misses": 5
            },
            "sources": {
                "attempted": ["DCAT_AP", "RSS", "CKAN"],
                "succeeded": ["DCAT_AP", "RSS"],
                "failed": ["CKAN"]
            },
            "errors": [
                {
                    "source": "CKAN",
                    "error": "Connection timeout",
                    "timestamp": "2025-10-14T02:15:23Z"
                }
            ],
            "airflow_metadata": {
                "dag_id": "daily_full_ingestion",
                "run_id": "scheduled__2025-10-14T02:00:00+00:00",
                "task_id": "fetch_aneel_data"
            },
            "ttl": 1731715456  # 30 days
        }
    },
    
    # ------------------------------------------------------------------------
    # 2.3: API Cache Items
    # ------------------------------------------------------------------------
    "api_cache": {
        "endpoint_response": {
            "cache_key": "md5:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
            "endpoint": "/api/v1/datasets",
            "method": "GET",
            "query_params": {
                "limit": 20,
                "category": "geracao_distribuida"
            },
            "response_data": {
                "total": 150,
                "items": [...]
            },
            "status_code": 200,
            "created_at": 1729123456,
            "hit_count": 15,
            "ttl": 1729127056  # 1 hour
        }
    },
    
    # ------------------------------------------------------------------------
    # 2.4: Session Items
    # ------------------------------------------------------------------------
    "sessions": {
        "user_session": {
            "session_id": "sess_a1b2c3d4e5f6g7h8",
            "user_id": "user_123456",
            "connection_id": "conn_xyz789",  # WebSocket connection
            "connection_type": "websocket",
            "ip_address": "192.168.1.100",
            "user_agent": "Mozilla/5.0...",
            "authenticated": True,
            "permissions": ["read:datasets", "read:products"],
            "created_at": 1729123456,
            "last_activity_at": 1729123556,
            "metadata": {
                "client_app": "YSH Dashboard",
                "api_version": "v1"
            },
            "ttl": 1729209856  # 24 hours
        }
    }
}

# ============================================================================
# SECTION 3: ACCESS PATTERNS
# ============================================================================

ACCESS_PATTERNS = """
============================================================================
DynamoDB Access Patterns Documentation
============================================================================

TABLE: ysh-pipeline-cache
-----------------------------------
Pattern 1: Get latest ingestion
    PK: "latest"
    SK: "ingestion"
    
Pattern 2: Get dataset by ID
    PK: "dataset"
    SK: {aneel_dataset_id}
    
Pattern 3: Get search results
    PK: "search"
    SK: md5({query_params_json})
    
Pattern 4: Get fallback data by category
    PK: "fallback"
    SK: "{category}#{state}"
    
Pattern 5: Query by source (GSI)
    IndexName: "SourceIndex"
    PK: {source}  # "DCAT_AP", "RSS", "CKAN"
    SK: timestamp (range query for time-based filtering)
    
Pattern 6: Query by category (GSI)
    IndexName: "CategoryIndex"
    PK: {category}  # "geracao_distribuida", "tarifas", etc.
    SK: timestamp (range query)

TABLE: ysh-ingestion-metadata
-----------------------------------
Pattern 1: Get run by ID
    PK: {run_id}
    SK: {timestamp}
    
Pattern 2: Get latest runs by workflow (GSI)
    IndexName: "WorkflowIndex"
    PK: {workflow_name}  # "daily_full_ingestion"
    SK: timestamp DESC (get latest N runs)
    
Pattern 3: Get failed runs (GSI)
    IndexName: "StatusIndex"
    PK: "FAILED"
    SK: timestamp DESC

TABLE: ysh-api-cache
-----------------------------------
Pattern 1: Get cached response
    PK: md5({endpoint + method + query_params})
    
Pattern 2: Invalidate cache by endpoint (GSI)
    IndexName: "EndpointIndex"
    PK: {endpoint}  # "/api/v1/datasets"
    SK: created_at (get all cached responses for endpoint)

TABLE: ysh-sessions
-----------------------------------
Pattern 1: Get session by ID
    PK: {session_id}
    
Pattern 2: Get all sessions for user (GSI)
    IndexName: "UserIndex"
    PK: {user_id}
    SK: created_at DESC
"""

# ============================================================================
# SECTION 4: PYTHON SETUP SCRIPT
# ============================================================================

def create_dynamodb_tables(
    region: str = 'us-east-1',
    dry_run: bool = False
) -> Dict[str, Any]:
    """
    Create all DynamoDB tables for YSH pipeline.
    
    Args:
        region: AWS region
        dry_run: If True, only print table definitions without creating
        
    Returns:
        Dict with creation results
    """
    dynamodb = boto3.client('dynamodb', region_name=region)
    results = {}
    
    for table_name, table_config in DYNAMODB_TABLES.items():
        try:
            if dry_run:
                print(f"\n[DRY RUN] Would create table: {table_name}")
                print(f"Config: {table_config}")
                results[table_name] = {"status": "dry_run", "config": table_config}
                continue
            
            # Check if table exists
            try:
                response = dynamodb.describe_table(TableName=table_name)
                print(f"✓ Table {table_name} already exists")
                results[table_name] = {
                    "status": "exists",
                    "arn": response['Table']['TableArn']
                }
                continue
            except dynamodb.exceptions.ResourceNotFoundException:
                pass
            
            # Create table
            print(f"Creating table: {table_name}...")
            response = dynamodb.create_table(**table_config)
            
            # Wait for table to be active
            waiter = dynamodb.get_waiter('table_exists')
            waiter.wait(TableName=table_name)
            
            print(f"✓ Table {table_name} created successfully")
            results[table_name] = {
                "status": "created",
                "arn": response['TableDescription']['TableArn']
            }
            
        except Exception as e:
            print(f"✗ Error creating table {table_name}: {str(e)}")
            results[table_name] = {
                "status": "error",
                "error": str(e)
            }
    
    return results


def delete_dynamodb_tables(
    region: str = 'us-east-1',
    confirm: bool = False
) -> Dict[str, Any]:
    """
    Delete all DynamoDB tables (USE WITH CAUTION!).
    
    Args:
        region: AWS region
        confirm: Must be True to actually delete
        
    Returns:
        Dict with deletion results
    """
    if not confirm:
        print("ERROR: Must set confirm=True to delete tables")
        return {"status": "aborted"}
    
    dynamodb = boto3.client('dynamodb', region_name=region)
    results = {}
    
    for table_name in DYNAMODB_TABLES.keys():
        try:
            print(f"Deleting table: {table_name}...")
            dynamodb.delete_table(TableName=table_name)
            
            # Wait for table to be deleted
            waiter = dynamodb.get_waiter('table_not_exists')
            waiter.wait(TableName=table_name)
            
            print(f"✓ Table {table_name} deleted")
            results[table_name] = {"status": "deleted"}
            
        except dynamodb.exceptions.ResourceNotFoundException:
            print(f"✓ Table {table_name} does not exist")
            results[table_name] = {"status": "not_found"}
            
        except Exception as e:
            print(f"✗ Error deleting table {table_name}: {str(e)}")
            results[table_name] = {
                "status": "error",
                "error": str(e)
            }
    
    return results


def get_table_status(region: str = 'us-east-1') -> Dict[str, Any]:
    """Get status of all DynamoDB tables."""
    dynamodb = boto3.client('dynamodb', region_name=region)
    results = {}
    
    for table_name in DYNAMODB_TABLES.keys():
        try:
            response = dynamodb.describe_table(TableName=table_name)
            table = response['Table']
            results[table_name] = {
                "status": table['TableStatus'],
                "item_count": table.get('ItemCount', 0),
                "size_bytes": table.get('TableSizeBytes', 0),
                "created": table['CreationDateTime'].isoformat()
            }
        except dynamodb.exceptions.ResourceNotFoundException:
            results[table_name] = {"status": "NOT_FOUND"}
        except Exception as e:
            results[table_name] = {
                "status": "ERROR",
                "error": str(e)
            }
    
    return results


# ============================================================================
# SECTION 5: CLOUDFORMATION TEMPLATE
# ============================================================================

CLOUDFORMATION_TEMPLATE = """
AWSTemplateFormatVersion: '2010-09-09'
Description: 'YSH Data Pipeline - DynamoDB Tables'

Parameters:
  EnvironmentName:
    Type: String
    Default: Production
    AllowedValues:
      - Development
      - Staging
      - Production
    Description: Environment name
  
  BillingMode:
    Type: String
    Default: PAY_PER_REQUEST
    AllowedValues:
      - PAY_PER_REQUEST
      - PROVISIONED
    Description: DynamoDB billing mode

Resources:
  # Pipeline Cache Table
  PipelineCacheTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'ysh-pipeline-cache-${EnvironmentName}'
      BillingMode: !Ref BillingMode
      AttributeDefinitions:
        - AttributeName: pk
          AttributeType: S
        - AttributeName: sk
          AttributeType: S
        - AttributeName: source
          AttributeType: S
        - AttributeName: category
          AttributeType: S
        - AttributeName: timestamp
          AttributeType: N
      KeySchema:
        - AttributeName: pk
          KeyType: HASH
        - AttributeName: sk
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: SourceIndex
          KeySchema:
            - AttributeName: source
              KeyType: HASH
            - AttributeName: timestamp
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
        - IndexName: CategoryIndex
          KeySchema:
            - AttributeName: category
              KeyType: HASH
            - AttributeName: timestamp
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      StreamSpecification:
        StreamViewType: NEW_AND_OLD_IMAGES
      TimeToLiveSpecification:
        Enabled: true
        AttributeName: ttl
      Tags:
        - Key: Project
          Value: YSH
        - Key: Environment
          Value: !Ref EnvironmentName
        - Key: Component
          Value: Cache

  # Ingestion Metadata Table
  IngestionMetadataTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'ysh-ingestion-metadata-${EnvironmentName}'
      BillingMode: !Ref BillingMode
      AttributeDefinitions:
        - AttributeName: run_id
          AttributeType: S
        - AttributeName: timestamp
          AttributeType: N
        - AttributeName: workflow_name
          AttributeType: S
        - AttributeName: status
          AttributeType: S
      KeySchema:
        - AttributeName: run_id
          KeyType: HASH
        - AttributeName: timestamp
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: WorkflowIndex
          KeySchema:
            - AttributeName: workflow_name
              KeyType: HASH
            - AttributeName: timestamp
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
        - IndexName: StatusIndex
          KeySchema:
            - AttributeName: status
              KeyType: HASH
            - AttributeName: timestamp
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      StreamSpecification:
        StreamViewType: NEW_AND_OLD_IMAGES
      TimeToLiveSpecification:
        Enabled: true
        AttributeName: ttl
      Tags:
        - Key: Project
          Value: YSH
        - Key: Environment
          Value: !Ref EnvironmentName
        - Key: Component
          Value: Pipeline

  # API Cache Table
  APICacheTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'ysh-api-cache-${EnvironmentName}'
      BillingMode: !Ref BillingMode
      AttributeDefinitions:
        - AttributeName: cache_key
          AttributeType: S
        - AttributeName: endpoint
          AttributeType: S
        - AttributeName: created_at
          AttributeType: N
      KeySchema:
        - AttributeName: cache_key
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: EndpointIndex
          KeySchema:
            - AttributeName: endpoint
              KeyType: HASH
            - AttributeName: created_at
              KeyType: RANGE
          Projection:
            ProjectionType: KEYS_ONLY
      TimeToLiveSpecification:
        Enabled: true
        AttributeName: ttl
      Tags:
        - Key: Project
          Value: YSH
        - Key: Environment
          Value: !Ref EnvironmentName
        - Key: Component
          Value: API

  # Sessions Table
  SessionsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'ysh-sessions-${EnvironmentName}'
      BillingMode: !Ref BillingMode
      AttributeDefinitions:
        - AttributeName: session_id
          AttributeType: S
        - AttributeName: user_id
          AttributeType: S
        - AttributeName: created_at
          AttributeType: N
      KeySchema:
        - AttributeName: session_id
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: UserIndex
          KeySchema:
            - AttributeName: user_id
              KeyType: HASH
            - AttributeName: created_at
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      TimeToLiveSpecification:
        Enabled: true
        AttributeName: ttl
      Tags:
        - Key: Project
          Value: YSH
        - Key: Environment
          Value: !Ref EnvironmentName
        - Key: Component
          Value: Sessions

Outputs:
  PipelineCacheTableName:
    Description: Pipeline cache table name
    Value: !Ref PipelineCacheTable
    Export:
      Name: !Sub '${AWS::StackName}-PipelineCacheTable'
  
  PipelineCacheTableArn:
    Description: Pipeline cache table ARN
    Value: !GetAtt PipelineCacheTable.Arn
    Export:
      Name: !Sub '${AWS::StackName}-PipelineCacheTableArn'
  
  IngestionMetadataTableName:
    Description: Ingestion metadata table name
    Value: !Ref IngestionMetadataTable
    Export:
      Name: !Sub '${AWS::StackName}-IngestionMetadataTable'
  
  APICacheTableName:
    Description: API cache table name
    Value: !Ref APICacheTable
    Export:
      Name: !Sub '${AWS::StackName}-APICacheTable'
  
  SessionsTableName:
    Description: Sessions table name
    Value: !Ref SessionsTable
    Export:
      Name: !Sub '${AWS::StackName}-SessionsTable'
"""

# ============================================================================
# SECTION 6: CDK CONSTRUCT (Python)
# ============================================================================

CDK_CONSTRUCT = """
from aws_cdk import (
    Stack,
    RemovalPolicy,
    aws_dynamodb as dynamodb
)
from constructs import Construct

class YSHDynamoDBStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # Pipeline Cache Table
        self.cache_table = dynamodb.Table(
            self, "PipelineCacheTable",
            table_name="ysh-pipeline-cache",
            partition_key=dynamodb.Attribute(
                name="pk",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="sk",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            stream=dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
            time_to_live_attribute="ttl",
            removal_policy=RemovalPolicy.RETAIN
        )
        
        # Add GSI: SourceIndex
        self.cache_table.add_global_secondary_index(
            index_name="SourceIndex",
            partition_key=dynamodb.Attribute(
                name="source",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="timestamp",
                type=dynamodb.AttributeType.NUMBER
            ),
            projection_type=dynamodb.ProjectionType.ALL
        )
        
        # Add GSI: CategoryIndex
        self.cache_table.add_global_secondary_index(
            index_name="CategoryIndex",
            partition_key=dynamodb.Attribute(
                name="category",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="timestamp",
                type=dynamodb.AttributeType.NUMBER
            ),
            projection_type=dynamodb.ProjectionType.ALL
        )
        
        # Ingestion Metadata Table
        self.metadata_table = dynamodb.Table(
            self, "IngestionMetadataTable",
            table_name="ysh-ingestion-metadata",
            partition_key=dynamodb.Attribute(
                name="run_id",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="timestamp",
                type=dynamodb.AttributeType.NUMBER
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            stream=dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
            time_to_live_attribute="ttl",
            removal_policy=RemovalPolicy.RETAIN
        )
        
        # Add GSI: WorkflowIndex
        self.metadata_table.add_global_secondary_index(
            index_name="WorkflowIndex",
            partition_key=dynamodb.Attribute(
                name="workflow_name",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="timestamp",
                type=dynamodb.AttributeType.NUMBER
            ),
            projection_type=dynamodb.ProjectionType.ALL
        )
        
        # Add GSI: StatusIndex
        self.metadata_table.add_global_secondary_index(
            index_name="StatusIndex",
            partition_key=dynamodb.Attribute(
                name="status",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="timestamp",
                type=dynamodb.AttributeType.NUMBER
            ),
            projection_type=dynamodb.ProjectionType.ALL
        )
        
        # API Cache Table
        self.api_cache_table = dynamodb.Table(
            self, "APICacheTable",
            table_name="ysh-api-cache",
            partition_key=dynamodb.Attribute(
                name="cache_key",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            time_to_live_attribute="ttl",
            removal_policy=RemovalPolicy.RETAIN
        )
        
        # Add GSI: EndpointIndex
        self.api_cache_table.add_global_secondary_index(
            index_name="EndpointIndex",
            partition_key=dynamodb.Attribute(
                name="endpoint",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="created_at",
                type=dynamodb.AttributeType.NUMBER
            ),
            projection_type=dynamodb.ProjectionType.KEYS_ONLY
        )
        
        # Sessions Table
        self.sessions_table = dynamodb.Table(
            self, "SessionsTable",
            table_name="ysh-sessions",
            partition_key=dynamodb.Attribute(
                name="session_id",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            time_to_live_attribute="ttl",
            removal_policy=RemovalPolicy.RETAIN
        )
        
        # Add GSI: UserIndex
        self.sessions_table.add_global_secondary_index(
            index_name="UserIndex",
            partition_key=dynamodb.Attribute(
                name="user_id",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="created_at",
                type=dynamodb.AttributeType.NUMBER
            ),
            projection_type=dynamodb.ProjectionType.ALL
        )
"""

# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python dynamodb_schema.py create [--dry-run] [--region us-east-1]")
        print("  python dynamodb_schema.py status [--region us-east-1]")
        print("  python dynamodb_schema.py delete --confirm [--region us-east-1]")
        print("  python dynamodb_schema.py cloudformation > template.yaml")
        sys.exit(1)
    
    command = sys.argv[1]
    region = 'us-east-1'
    
    if '--region' in sys.argv:
        region_idx = sys.argv.index('--region')
        region = sys.argv[region_idx + 1]
    
    if command == 'create':
        dry_run = '--dry-run' in sys.argv
        results = create_dynamodb_tables(region=region, dry_run=dry_run)
        print("\n" + "="*60)
        print("RESULTS:")
        print(json.dumps(results, indent=2))
    
    elif command == 'status':
        results = get_table_status(region=region)
        print("\n" + "="*60)
        print("TABLE STATUS:")
        print(json.dumps(results, indent=2))
    
    elif command == 'delete':
        confirm = '--confirm' in sys.argv
        results = delete_dynamodb_tables(region=region, confirm=confirm)
        print("\n" + "="*60)
        print("DELETION RESULTS:")
        print(json.dumps(results, indent=2))
    
    elif command == 'cloudformation':
        print(CLOUDFORMATION_TEMPLATE)
    
    elif command == 'access-patterns':
        print(ACCESS_PATTERNS)
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
