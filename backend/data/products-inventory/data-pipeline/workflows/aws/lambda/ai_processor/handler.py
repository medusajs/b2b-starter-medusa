"""
YSH AI Processor Lambda
Processes data using Ollama for enrichment
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, List
import boto3
import requests

# AWS Clients
s3_client = boto3.client('s3')

# Configuration
OLLAMA_ENDPOINT = os.environ.get('OLLAMA_ENDPOINT', 'http://ollama:11434')
BUCKET_NAME = os.environ.get('S3_BUCKET', 'ysh-pipeline-data')
DEFAULT_MODEL = os.environ.get('OLLAMA_MODEL', 'llama3.2:3b')


def call_ollama(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """Call Ollama API for text generation"""
    try:
        response = requests.post(
            f"{OLLAMA_ENDPOINT}/api/generate",
            json={
                'model': model,
                'prompt': prompt,
                'stream': False,
                'options': {
                    'temperature': 0.3,
                    'top_p': 0.9
                }
            },
            timeout=120
        )
        
        if response.status_code == 200:
            return response.json().get('response', '')
        else:
            print(f"Ollama error: {response.status_code}")
            return ''
            
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        return ''


def enrich_dataset(dataset: Dict[str, Any]) -> Dict[str, Any]:
    """Enrich single dataset with AI metadata"""
    
    title = dataset.get('title', '')
    description = dataset.get('description', '')
    
    # Build prompt
    prompt = f"""Analise este dataset brasileiro de energia:

Título: {title}
Descrição: {description}

Retorne JSON com:
1. categoria (energia_solar, tarifa, homologacao, certificacao, etc)
2. palavras_chave (lista de 5 palavras relevantes)
3. resumo_curto (50 palavras)
4. relevancia_ysh (1-10, quanto é relevante para sistema solar fotovoltaico)

JSON:"""
    
    # Call Ollama
    response = call_ollama(prompt)
    
    # Parse JSON from response
    try:
        # Extract JSON from response
        json_start = response.find('{')
        json_end = response.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_str = response[json_start:json_end]
            enriched = json.loads(json_str)
            
            # Add enriched fields
            dataset['ai_metadata'] = enriched
            dataset['enriched_at'] = datetime.utcnow().isoformat()
            
    except Exception as e:
        print(f"Error parsing Ollama response: {e}")
        dataset['ai_metadata'] = {
            'error': str(e),
            'raw_response': response[:200]
        }
    
    return dataset


def lambda_handler(event, context):
    """
    Lambda entry point
    
    Event parameters:
    - aneel_data: dict with datasets
    - utility_data: list of utility scrape results
    - model: ollama model to use
    - action: enrich_metadata | summarize | classify
    """
    
    print(f"Event keys: {list(event.keys())}")
    
    try:
        # Extract data
        aneel_data = event.get('aneel_data', {})
        utility_data = event.get('utility_data', [])
        model = event.get('model', DEFAULT_MODEL)
        action = event.get('action', 'enrich_metadata')
        
        # Combine all datasets
        all_datasets = []
        
        if isinstance(aneel_data, dict):
            all_datasets.extend(aneel_data.get('datasets', []))
        
        if isinstance(utility_data, list):
            for utility_result in utility_data:
                if isinstance(utility_result, dict):
                    all_datasets.extend(utility_result.get('datasets', []))
        
        print(f"Processing {len(all_datasets)} datasets")
        
        # Process datasets
        processed_datasets = []
        
        if action == 'enrich_metadata':
            # Limit to 20 datasets (Lambda time/memory constraints)
            for dataset in all_datasets[:20]:
                enriched = enrich_dataset(dataset)
                processed_datasets.append(enriched)
                print(f"Enriched: {dataset.get('title', 'unknown')[:50]}")
        
        # Prepare result
        result = {
            'datasets': processed_datasets,
            'count': len(processed_datasets),
            'timestamp': datetime.utcnow().isoformat(),
            'model': model,
            'action': action
        }
        
        # Save to S3
        s3_key = f"processed/{datetime.utcnow().strftime('%Y/%m/%d')}/ai-enriched.json"
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=json.dumps(result, indent=2, ensure_ascii=False),
            ContentType='application/json'
        )
        print(f"Saved to S3: s3://{BUCKET_NAME}/{s3_key}")
        
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
                'message': 'Failed to process data with AI'
            }
        }
