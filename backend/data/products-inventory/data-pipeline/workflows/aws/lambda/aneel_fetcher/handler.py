"""
YSH ANEEL Data Fetcher Lambda
Fetches data from ANEEL APIs (CKAN, RSS, DCAT)
"""

import json
import os
from datetime import datetime
from typing import Dict, Any
import boto3
import aiohttp
import asyncio
import feedparser

# AWS Clients
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

# Configuration
BUCKET_NAME = os.environ.get('S3_BUCKET', 'ysh-pipeline-data')
TABLE_NAME = os.environ.get('DYNAMODB_TABLE', 'ysh-pipeline-cache')

# ANEEL Endpoints
ANEEL_CKAN_API = "https://dadosabertos.aneel.gov.br/api/3/action"
ANEEL_RSS_FEED = "https://dadosabertos-aneel.opendata.arcgis.com/api/feed/rss/2.0"
ANEEL_DCAT_CATALOG = "https://dadosabertos.aneel.gov.br/catalog.xml"


async def fetch_ckan_datasets() -> list:
    """Fetch datasets from ANEEL CKAN API"""
    datasets = []
    
    try:
        async with aiohttp.ClientSession() as session:
            # Get package list
            async with session.get(f"{ANEEL_CKAN_API}/package_list") as response:
                if response.status == 200:
                    data = await response.json()
                    package_ids = data.get('result', [])
                    
                    # Fetch first 50 packages (AWS Lambda time limit)
                    for package_id in package_ids[:50]:
                        async with session.get(
                            f"{ANEEL_CKAN_API}/package_show",
                            params={'id': package_id}
                        ) as pkg_response:
                            if pkg_response.status == 200:
                                pkg_data = await pkg_response.json()
                                datasets.append(pkg_data.get('result', {}))
                        
                        # Small delay to avoid rate limiting
                        await asyncio.sleep(0.1)
                        
    except Exception as e:
        print(f"Error fetching CKAN datasets: {e}")
        raise
    
    return datasets


async def fetch_rss_feed() -> list:
    """Fetch datasets from ANEEL RSS feed"""
    datasets = []
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(ANEEL_RSS_FEED) as response:
                if response.status == 200:
                    content = await response.text()
                    feed = feedparser.parse(content)
                    
                    for entry in feed.entries:
                        datasets.append({
                            'id': entry.get('guid', entry.get('link')),
                            'title': entry.get('title', ''),
                            'description': entry.get('summary', ''),
                            'published': entry.get('published', ''),
                            'link': entry.get('link', ''),
                            'source': 'rss'
                        })
    except Exception as e:
        print(f"Error fetching RSS feed: {e}")
        raise
    
    return datasets


def save_to_s3(data: Dict[str, Any], key: str) -> None:
    """Save data to S3"""
    try:
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=json.dumps(data, indent=2, ensure_ascii=False),
            ContentType='application/json',
            Metadata={
                'timestamp': datetime.utcnow().isoformat(),
                'source': 'ysh-aneel-fetcher'
            }
        )
        print(f"Saved to S3: s3://{BUCKET_NAME}/{key}")
    except Exception as e:
        print(f"Error saving to S3: {e}")
        raise


def save_to_dynamodb(data: Dict[str, Any]) -> None:
    """Save data to DynamoDB"""
    try:
        table = dynamodb.Table(TABLE_NAME)
        table.put_item(
            Item={
                'pk': 'latest',
                'sk': 'ingestion',
                'data': json.dumps(data),
                'timestamp': datetime.utcnow().isoformat(),
                'count': len(data.get('datasets', [])),
                'ttl': int(datetime.utcnow().timestamp()) + 86400  # 24 hours
            }
        )
        print(f"Saved to DynamoDB: {TABLE_NAME}")
    except Exception as e:
        print(f"Error saving to DynamoDB: {e}")
        raise


def lambda_handler(event, context):
    """
    Lambda entry point
    
    Event parameters:
    - action: fetch_all | fetch_rss | fetch_ckan
    - include_rss: boolean
    - include_dcat: boolean
    """
    
    print(f"Event: {json.dumps(event)}")
    
    action = event.get('action', 'fetch_all')
    include_rss = event.get('include_rss', True)
    
    try:
        datasets = []
        
        # Fetch based on action
        if action == 'fetch_all':
            # Fetch CKAN datasets
            ckan_datasets = asyncio.run(fetch_ckan_datasets())
            datasets.extend(ckan_datasets)
            print(f"Fetched {len(ckan_datasets)} CKAN datasets")
            
            # Fetch RSS feed
            if include_rss:
                rss_datasets = asyncio.run(fetch_rss_feed())
                datasets.extend(rss_datasets)
                print(f"Fetched {len(rss_datasets)} RSS datasets")
                
        elif action == 'fetch_rss':
            datasets = asyncio.run(fetch_rss_feed())
            print(f"Fetched {len(datasets)} RSS datasets")
            
        elif action == 'fetch_ckan':
            datasets = asyncio.run(fetch_ckan_datasets())
            print(f"Fetched {len(datasets)} CKAN datasets")
        
        # Prepare response
        result = {
            'datasets': datasets,
            'count': len(datasets),
            'timestamp': datetime.utcnow().isoformat(),
            'action': action
        }
        
        # Save to S3
        s3_key = f"ingestion/{datetime.utcnow().strftime('%Y/%m/%d')}/aneel-data.json"
        save_to_s3(result, s3_key)
        
        # Save to DynamoDB
        save_to_dynamodb(result)
        
        return {
            'statusCode': 200,
            'body': result
        }
        
    except Exception as e:
        print(f"Error in lambda_handler: {e}")
        return {
            'statusCode': 500,
            'body': {
                'error': str(e),
                'message': 'Failed to fetch ANEEL data'
            }
        }
