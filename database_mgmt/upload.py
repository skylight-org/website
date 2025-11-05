#!/usr/bin/env python3
"""
Upload script for Sky Light leaderboard data to Supabase.

This script reads experimental results from experiments.jsonl and uploads them
to a Supabase PostgreSQL database following the schema defined in DB_Schema.md.

Usage:
    export SUPABASE_URL="https://your-project.supabase.co"
    export SUPABASE_KEY="your-anon-key"
    python upload.py
"""

import os
import json
import sys
from datetime import datetime
from typing import Dict, List, Optional, Any, Set
from pathlib import Path

try:
    from supabase import create_client, Client
except ImportError:
    print("Error: supabase-py not installed. Run: pip install supabase")
    sys.exit(1)


class SupabaseUploader:
    """Handles uploading experimental data to Supabase database."""

    def __init__(self, supabase_url: str, supabase_key: str):
        """Initialize Supabase client."""
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
        # Caches to avoid duplicate queries
        self.benchmark_cache: Dict[str, str] = {}  # name -> id
        self.dataset_cache: Dict[tuple, str] = {}  # (benchmark_id, name) -> id
        self.metric_cache: Dict[str, str] = {}  # name -> id
        self.baseline_cache: Dict[str, str] = {}  # name -> id
        self.llm_cache: Dict[str, str] = {}  # name -> id
        self.config_cache: Dict[tuple, str] = {}  # (baseline_id, dataset_id, llm_id, sparsity, aux_mem) -> id
        self.dataset_metric_cache: Set[tuple] = set()  # (dataset_id, metric_id)
        
        self.experimental_run_id: Optional[str] = None

    def parse_jsonl(self, filepath: str) -> List[Dict[str, Any]]:
        """Parse JSONL file and return list of records."""
        records = []
        with open(filepath, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                try:
                    record = json.loads(line.strip())
                    records.append(record)
                except json.JSONDecodeError as e:
                    print(f"Warning: Skipping line {line_num} due to JSON error: {e}")
        
        print(f"Loaded {len(records)} records from {filepath}")
        return records

    def extract_provider_from_model_name(self, model_name: str) -> str:
        """Extract provider from model name (e.g., 'meta-llama/...' -> 'Meta')."""
        provider_map = {
            'meta-llama': 'Meta',
            'meta': 'Meta',
            'qwen': 'Qwen',
            'openai': 'OpenAI',
            'anthropic': 'Anthropic',
            'google': 'Google',
            'mistralai': 'Mistral AI',
        }
        
        model_lower = model_name.lower()
        for key, value in provider_map.items():
            if key in model_lower:
                return value
        
        # Fallback: use first part before slash or full name
        if '/' in model_name:
            return model_name.split('/')[0].title()
        return 'Unknown'

    def extract_sparsity_from_record(self, record: Dict[str, Any]) -> Optional[float]:
        """
        Extract target sparsity from record.
        
        Converts average_density to percentage (e.g., 0.022 -> 2.2).
        Returns None for dense baseline or if not available.
        """
        if record.get('baseline') == 'dense':
            return None
        
        average_density = record.get('average_density')
        if average_density is not None:
            # Convert to percentage (0.022 -> 2.2%)
            return round(average_density * 100, 2)
        
        return None

    def upsert_benchmark(self, name: str) -> str:
        """Create or get benchmark by name."""
        if name in self.benchmark_cache:
            return self.benchmark_cache[name]
        
        try:
            # Try to find existing
            response = self.supabase.table('benchmarks').select('id').eq('name', name).execute()
            
            if response.data and len(response.data) > 0:
                benchmark_id = response.data[0]['id']
            else:
                # Insert new
                description = f"RULER benchmark for evaluating long-context understanding"
                paper_url = "https://arxiv.org/abs/2404.06654"
                
                insert_response = self.supabase.table('benchmarks').insert({
                    'name': name,
                    'description': description,
                    'paper_url': paper_url
                }).execute()
                
                benchmark_id = insert_response.data[0]['id']
                print(f"  Created benchmark: {name}")
            
            self.benchmark_cache[name] = benchmark_id
            return benchmark_id
            
        except Exception as e:
            print(f"Error upserting benchmark '{name}': {e}")
            raise

    def upsert_dataset(self, benchmark_id: str, name: str) -> str:
        """Create or get dataset by benchmark_id and name."""
        cache_key = (benchmark_id, name)
        if cache_key in self.dataset_cache:
            return self.dataset_cache[cache_key]
        
        try:
            # Try to find existing
            response = self.supabase.table('datasets').select('id').eq('benchmark_id', benchmark_id).eq('name', name).execute()
            
            if response.data and len(response.data) > 0:
                dataset_id = response.data[0]['id']
            else:
                # Insert new
                dataset_descriptions = {
                    'qa_1': 'Question Answering Level 1',
                    'qa_2': 'Question Answering Level 2',
                    'fwe': 'First Word Extraction',
                    'vt': 'Variable Tracking',
                    'niah_multikey_2': 'Needle In A Haystack - Multi-key (2 keys)',
                    'niah_multikey_3': 'Needle In A Haystack - Multi-key (3 keys)',
                }
                
                description = dataset_descriptions.get(name, f"Dataset: {name}")
                
                insert_response = self.supabase.table('datasets').insert({
                    'benchmark_id': benchmark_id,
                    'name': name,
                    'description': description
                }).execute()
                
                dataset_id = insert_response.data[0]['id']
                print(f"  Created dataset: {name}")
            
            self.dataset_cache[cache_key] = dataset_id
            return dataset_id
            
        except Exception as e:
            print(f"Error upserting dataset '{name}': {e}")
            raise

    def upsert_metric(self, name: str) -> str:
        """Create or get metric by name."""
        if name in self.metric_cache:
            return self.metric_cache[name]
        
        try:
            # Try to find existing
            response = self.supabase.table('metrics').select('id').eq('name', name).execute()
            
            if response.data and len(response.data) > 0:
                metric_id = response.data[0]['id']
            else:
                # Insert new
                metric_definitions = {
                    'string_match': {
                        'display_name': 'String Match',
                        'description': 'Percentage of exact string matches',
                        'unit': '%',
                        'higher_is_better': True
                    },
                    'accuracy': {
                        'display_name': 'Accuracy',
                        'description': 'Overall accuracy percentage',
                        'unit': '%',
                        'higher_is_better': True
                    },
                    'f1_score': {
                        'display_name': 'F1 Score',
                        'description': 'Harmonic mean of precision and recall',
                        'unit': None,
                        'higher_is_better': True
                    },
                }
                
                metric_def = metric_definitions.get(name, {
                    'display_name': name.replace('_', ' ').title(),
                    'description': f"Metric: {name}",
                    'unit': None,
                    'higher_is_better': True
                })
                
                insert_response = self.supabase.table('metrics').insert({
                    'name': name,
                    'display_name': metric_def['display_name'],
                    'description': metric_def['description'],
                    'unit': metric_def['unit'],
                    'higher_is_better': metric_def['higher_is_better']
                }).execute()
                
                metric_id = insert_response.data[0]['id']
                print(f"  Created metric: {name}")
            
            self.metric_cache[name] = metric_id
            return metric_id
            
        except Exception as e:
            print(f"Error upserting metric '{name}': {e}")
            raise

    def upsert_dataset_metric(self, dataset_id: str, metric_id: str, is_primary: bool = True):
        """Create dataset-metric relationship if not exists."""
        cache_key = (dataset_id, metric_id)
        if cache_key in self.dataset_metric_cache:
            return
        
        try:
            # Try to find existing
            response = self.supabase.table('dataset_metrics').select('id').eq('dataset_id', dataset_id).eq('metric_id', metric_id).execute()
            
            if not response.data or len(response.data) == 0:
                # Insert new
                self.supabase.table('dataset_metrics').insert({
                    'dataset_id': dataset_id,
                    'metric_id': metric_id,
                    'weight': 1.0,
                    'is_primary': is_primary
                }).execute()
            
            self.dataset_metric_cache.add(cache_key)
            
        except Exception as e:
            print(f"Error upserting dataset_metric: {e}")
            raise

    def upsert_baseline(self, name: str) -> str:
        """Create or get baseline by name."""
        if name in self.baseline_cache:
            return self.baseline_cache[name]
        
        try:
            # Try to find existing
            response = self.supabase.table('baselines').select('id').eq('name', name).execute()
            
            if response.data and len(response.data) > 0:
                baseline_id = response.data[0]['id']
            else:
                # Insert new
                baseline_descriptions = {
                    'dense': 'Full dense attention (baseline)',
                    'oracle-topk': 'Oracle Top-K attention selection',
                    'vAttention(oracle-topk)': 'vAttention with Oracle Top-K and adaptive sampling',
                }
                
                description = baseline_descriptions.get(name, f"Sparse attention method: {name}")
                
                insert_response = self.supabase.table('baselines').insert({
                    'name': name,
                    'description': description,
                    'version': '1.0'
                }).execute()
                
                baseline_id = insert_response.data[0]['id']
                print(f"  Created baseline: {name}")
            
            self.baseline_cache[name] = baseline_id
            return baseline_id
            
        except Exception as e:
            print(f"Error upserting baseline '{name}': {e}")
            raise

    def upsert_llm(self, model_name: str) -> str:
        """Create or get LLM by name."""
        if model_name in self.llm_cache:
            return self.llm_cache[model_name]
        
        try:
            # Try to find existing
            response = self.supabase.table('llms').select('id').eq('name', model_name).execute()
            
            if response.data and len(response.data) > 0:
                llm_id = response.data[0]['id']
            else:
                # Insert new
                provider = self.extract_provider_from_model_name(model_name)
                
                # Infer parameter count from model name
                parameter_count = None
                if '8B' in model_name:
                    parameter_count = 8_000_000_000
                elif '30B' in model_name:
                    parameter_count = 30_000_000_000
                elif '70B' in model_name:
                    parameter_count = 70_000_000_000
                
                insert_response = self.supabase.table('llms').insert({
                    'name': model_name,
                    'provider': provider,
                    'parameter_count': parameter_count,
                    'context_length': 131072  # 128k default for these models
                }).execute()
                
                llm_id = insert_response.data[0]['id']
                print(f"  Created LLM: {model_name}")
            
            self.llm_cache[model_name] = llm_id
            return llm_id
            
        except Exception as e:
            print(f"Error upserting LLM '{model_name}': {e}")
            raise

    def create_experimental_run(self, name: str = None) -> str:
        """Create a new experimental run."""
        try:
            if name is None:
                name = f"Upload {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            
            response = self.supabase.table('experimental_runs').insert({
                'name': name,
                'description': 'Uploaded from experiments.jsonl',
                'status': 'completed',
                'metadata': {'source': 'upload.py'}
            }).execute()
            
            run_id = response.data[0]['id']
            print(f"Created experimental run: {name} (ID: {run_id})")
            return run_id
            
        except Exception as e:
            print(f"Error creating experimental run: {e}")
            raise

    def upsert_configuration(
        self,
        baseline_id: str,
        dataset_id: str,
        llm_id: str,
        target_sparsity: Optional[float],
        aux_memory: int,
        config: Dict[str, Any]
    ) -> str:
        """Create or get configuration."""
        # Use -1 as sentinel for None values in cache key
        sparsity_key = target_sparsity if target_sparsity is not None else -1
        aux_mem_key = aux_memory if aux_memory is not None else -1
        
        cache_key = (baseline_id, dataset_id, llm_id, sparsity_key, aux_mem_key)
        if cache_key in self.config_cache:
            return self.config_cache[cache_key]
        
        try:
            # Build query for existing config
            query = self.supabase.table('configurations').select('id') \
                .eq('baseline_id', baseline_id) \
                .eq('dataset_id', dataset_id) \
                .eq('llm_id', llm_id)
            
            # Handle nullable fields
            if target_sparsity is not None:
                query = query.eq('target_sparsity', target_sparsity)
            else:
                query = query.is_('target_sparsity', 'null')
            
            if aux_memory is not None:
                query = query.eq('target_aux_memory', aux_memory)
            else:
                query = query.is_('target_aux_memory', 'null')
            
            response = query.execute()
            
            if response.data and len(response.data) > 0:
                config_id = response.data[0]['id']
            else:
                # Insert new
                insert_response = self.supabase.table('configurations').insert({
                    'baseline_id': baseline_id,
                    'dataset_id': dataset_id,
                    'llm_id': llm_id,
                    'target_sparsity': target_sparsity,
                    'target_aux_memory': aux_memory,
                    'additional_params': config  # Stored as JSONB
                }).execute()
                
                config_id = insert_response.data[0]['id']
            
            self.config_cache[cache_key] = config_id
            return config_id
            
        except Exception as e:
            print(f"Error upserting configuration: {e}")
            raise

    def insert_result(
        self,
        config_id: str,
        metric_id: str,
        run_id: str,
        value: float
    ):
        """Insert a result record."""
        try:
            # Check if result already exists
            response = self.supabase.table('results').select('id') \
                .eq('configuration_id', config_id) \
                .eq('metric_id', metric_id) \
                .eq('experimental_run_id', run_id) \
                .execute()
            
            if response.data and len(response.data) > 0:
                # Update existing result
                self.supabase.table('results').update({
                    'value': value
                }).eq('id', response.data[0]['id']).execute()
            else:
                # Insert new result
                self.supabase.table('results').insert({
                    'configuration_id': config_id,
                    'metric_id': metric_id,
                    'experimental_run_id': run_id,
                    'value': value
                }).execute()
            
        except Exception as e:
            print(f"Error inserting result: {e}")
            raise

    def process_record(self, record: Dict[str, Any]):
        """Process a single JSONL record and upload to database."""
        try:
            # Extract fields
            baseline_name = record['baseline']
            model_name = record['model_name']
            benchmark_name = record['benchmark']
            dataset_name = record['dataset']
            config = record['config']
            aux_memory = record.get('aux_memory')
            target_sparsity = self.extract_sparsity_from_record(record)
            benchmark_metrics = record.get('benchmark_metrics', {})
            
            # Upsert entities
            benchmark_id = self.upsert_benchmark(benchmark_name)
            dataset_id = self.upsert_dataset(benchmark_id, dataset_name)
            baseline_id = self.upsert_baseline(baseline_name)
            llm_id = self.upsert_llm(model_name)
            
            # Upsert metrics and dataset-metric relationships
            for metric_name in benchmark_metrics.keys():
                metric_id = self.upsert_metric(metric_name)
                self.upsert_dataset_metric(dataset_id, metric_id, is_primary=True)
            
            # Upsert configuration
            config_id = self.upsert_configuration(
                baseline_id=baseline_id,
                dataset_id=dataset_id,
                llm_id=llm_id,
                target_sparsity=target_sparsity,
                aux_memory=aux_memory,
                config=config
            )
            
            # Insert results
            for metric_name, value in benchmark_metrics.items():
                metric_id = self.metric_cache[metric_name]
                self.insert_result(
                    config_id=config_id,
                    metric_id=metric_id,
                    run_id=self.experimental_run_id,
                    value=value
                )
            
        except KeyError as e:
            print(f"Error: Missing required field {e} in record")
            raise
        except Exception as e:
            print(f"Error processing record: {e}")
            raise

    def upload_data(self, jsonl_filepath: str):
        """Main upload process."""
        print("=" * 60)
        print("Sky Light Data Upload to Supabase")
        print("=" * 60)
        
        # Parse JSONL file
        print("\n[1/3] Parsing JSONL file...")
        records = self.parse_jsonl(jsonl_filepath)
        
        # Create experimental run
        print("\n[2/3] Creating experimental run...")
        self.experimental_run_id = self.create_experimental_run()
        
        # Process records
        print("\n[3/3] Processing records...")
        total = len(records)
        for idx, record in enumerate(records, 1):
            try:
                print(f"\nProcessing record {idx}/{total}: {record['baseline']} on {record['dataset']} with {record['model_name']}")
                self.process_record(record)
                print(f"  ✓ Successfully processed")
            except Exception as e:
                print(f"  ✗ Failed: {e}")
                # Continue with next record instead of stopping
                continue
        
        print("\n" + "=" * 60)
        print("Upload complete!")
        print("=" * 60)
        print(f"Benchmarks: {len(self.benchmark_cache)}")
        print(f"Datasets: {len(self.dataset_cache)}")
        print(f"Metrics: {len(self.metric_cache)}")
        print(f"Baselines: {len(self.baseline_cache)}")
        print(f"LLMs: {len(self.llm_cache)}")
        print(f"Configurations: {len(self.config_cache)}")
        print(f"Results: {idx}")  # Approximate count


def main():
    """Main entry point."""
    # Get Supabase credentials from environment
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Error: Missing environment variables!")
        print("Please set SUPABASE_URL and SUPABASE_KEY:")
        print("  export SUPABASE_URL='https://your-project.supabase.co'")
        print("  export SUPABASE_KEY='your-anon-key'")
        sys.exit(1)
    
    # Get JSONL file path
    script_dir = Path(__file__).parent
    jsonl_path = script_dir / 'experiments.jsonl'
    
    if not jsonl_path.exists():
        print(f"Error: JSONL file not found at {jsonl_path}")
        sys.exit(1)
    
    # Create uploader and run
    uploader = SupabaseUploader(supabase_url, supabase_key)
    uploader.upload_data(str(jsonl_path))


if __name__ == '__main__':
    main()

