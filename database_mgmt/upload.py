#!/usr/bin/env python3
"""
Upload script for Sky Light leaderboard data to Supabase.

This script reads experimental results from JSONL files and uploads them
to a Supabase PostgreSQL database following the schema defined in DB_Schema.md.

Usage:
    export SUPABASE_URL="https://your-project.supabase.co"
    export SUPABASE_KEY="your-anon-key"
    python upload.py [--file path/to/data.jsonl] [--limit 50] [--resume 10] \\
                     [--models model1 model2] [--baselines baseline1 baseline2] \\
                     [--force-push]
"""

import os
import json
import sys
from datetime import datetime
import argparse
from typing import Dict, List, Optional, Any, Set, Tuple
from pathlib import Path
from collections import defaultdict
import threading # Keep for cache_lock, though less critical in sequential mode

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
        self.benchmark_cache: Dict[str, str] = {}
        self.dataset_cache: Dict[Tuple[str, str], str] = {}
        self.metric_cache: Dict[str, str] = {}
        self.baseline_cache: Dict[str, str] = {}
        self.llm_cache: Dict[str, str] = {}
        self.config_cache: Dict[Tuple, str] = {}
        self.dataset_metric_cache: Dict[Tuple[str, str], str] = {}
        
        # Lock for cache safety (good practice, low overhead)
        self.cache_lock = threading.Lock()
        
        # Track for cleanup operations
        self.experimental_run_id: Optional[str] = None
        self.processed_config_ids: Set[str] = set()

    def parse_jsonl(self, filepath: str) -> List[Dict[str, Any]]:
        """Parse JSONL file and return list of records."""
        records = []
        with open(filepath, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                try:
                    record = json.loads(line)
                    records.append(record)
                except json.JSONDecodeError as e:
                    print(f"Warning: Skipping line {line_num} due to JSON error: {e}")
        
        print(f"Loaded {len(records)} records from {filepath}")
        return records

    def extract_provider_from_model_name(self, model_name: str) -> str:
        """Extract provider from model name."""
        # Common provider mappings
        provider_map = {
            'meta-llama': 'Meta',
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
        
        # Use first part before slash if present
        if '/' in model_name:
            provider = model_name.split('/')[0]
            return provider.replace('-', ' ').title()
        
        return 'Unknown'

    def _handle_duplicate_key_error(self, error: Exception, table: str, key_field: str, key_value: str) -> Optional[str]:
        """
        Handle duplicate key errors by re-querying.
        Returns the ID if found, None otherwise.
        """
        if 'duplicate key' in str(error):
            response = self.supabase.table(table).select('id').eq(key_field, key_value).execute()
            if response.data:
                return response.data[0]['id']
        return None

    def extract_parameter_count(self, model_name: str) -> Optional[int]:
        """Extract parameter count from model name."""
        import re
        
        # Look for patterns like 3B, 7B, 70B, 3.2B, 8B-Instruct
        match = re.search(r'(\d+(?:\.\d+)?)[Bb](?:-|$|\s)', model_name)
        if match:
            billions = float(match.group(1))
            return int(billions * 1_000_000_000)
        
        return None

    def create_experimental_run(self, name: str = None) -> str:
        """Create a new experimental run."""
        try:
            if name is None:
                name = f"Upload {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            
            response = self.supabase.table('experimental_runs').insert({
                'name': name,
                'description': 'Uploaded from JSONL data',
                'status': 'completed',
                'metadata': {'source': 'upload.py'}
            }).execute()
            
            run_id = response.data[0]['id']
            print(f"Created experimental run: {name} (ID: {run_id})")
            return run_id
            
        except Exception as e:
            print(f"Error creating experimental run: {e}")
            raise

    def upsert_benchmark(self, name: str) -> str:
        """Create or get benchmark by name."""
        with self.cache_lock:
            if name in self.benchmark_cache:
                return self.benchmark_cache[name]
        
        try:
            # Try to find existing
            response = self.supabase.table('benchmarks').select('id').eq('name', name).execute()
            
            if response.data:
                benchmark_id = response.data[0]['id']
            else:
                # Insert new
                insert_data = {
                    'name': name,
                    'description': self._get_benchmark_description(name),
                }
                
                if name.lower() == 'ruler32k':
                    insert_data['paper_url'] = 'https://arxiv.org/abs/2404.06654'
                
                try:
                    insert_response = self.supabase.table('benchmarks').insert(insert_data).execute()
                    benchmark_id = insert_response.data[0]['id']
                    print(f"  Created benchmark: {name}")
                except Exception as e:
                    # Handle duplicate key error
                    existing_id = self._handle_duplicate_key_error(e, 'benchmarks', 'name', name)
                    if existing_id:
                        benchmark_id = existing_id
                    else:
                        raise
            
            with self.cache_lock:
                self.benchmark_cache[name] = benchmark_id
            return benchmark_id
            
        except Exception as e:
            print(f"Error upserting benchmark '{name}': {e}")
            raise

    def _get_benchmark_description(self, name: str) -> str:
        """Get benchmark description based on name."""
        descriptions = {
            'ruler32k': 'RULER benchmark for evaluating long-context understanding (32k)',
            'ruler128k': 'RULER benchmark for evaluating long-context understanding (128k)',
            'needlebench': 'Needle in a Haystack benchmark for long-context retrieval',
        }
        return descriptions.get(name.lower(), f"Benchmark: {name}")

    def upsert_dataset(self, benchmark_id: str, name: str) -> str:
        """Create or get dataset."""
        cache_key = (benchmark_id, name)
        with self.cache_lock:
            if cache_key in self.dataset_cache:
                return self.dataset_cache[cache_key]
        
        try:
            # Try to find existing
            response = self.supabase.table('datasets').select('id')\
                .eq('benchmark_id', benchmark_id)\
                .eq('name', name).execute()
            
            if response.data:
                dataset_id = response.data[0]['id']
            else:
                # Insert new
                try:
                    insert_response = self.supabase.table('datasets').insert({
                        'benchmark_id': benchmark_id,
                        'name': name,
                        'description': self._get_dataset_description(name)
                    }).execute()
                    dataset_id = insert_response.data[0]['id']
                    print(f"  Created dataset: {name}")
                except Exception as e:
                    # Handle duplicate key error
                    if 'duplicate key' in str(e):
                        response = self.supabase.table('datasets').select('id')\
                            .eq('benchmark_id', benchmark_id)\
                            .eq('name', name).execute()
                        if response.data:
                            dataset_id = response.data[0]['id']
                        else:
                            raise # Re-raise if re-query fails
                    else:
                        raise # Re-raise other errors
            
            with self.cache_lock:
                self.dataset_cache[cache_key] = dataset_id
            return dataset_id
            
        except Exception as e:
            print(f"Error upserting dataset '{name}': {e}")
            raise

    def _get_dataset_description(self, name: str) -> str:
        """Get dataset description based on name."""
        descriptions = {
            'qa_1': 'Question Answering Level 1',
            'qa_2': 'Question Answering Level 2',
            'fwe': 'First Word Extraction',
            'vt': 'Variable Tracking',
            'niah_multikey_2': 'Needle In A Haystack - Multi-key (2 keys)',
            'niah_multikey_3': 'Needle In A Haystack - Multi-key (3 keys)',
            'cwe': 'Common Word Extraction',
        }
        return descriptions.get(name, f"Dataset: {name}")

    def upsert_metric(self, name: str) -> str:
        """Create or get metric."""
        with self.cache_lock:
            if name in self.metric_cache:
                return self.metric_cache[name]
        
        try:
            # Try to find existing
            response = self.supabase.table('metrics').select('id').eq('name', name).execute()
            
            if response.data:
                metric_id = response.data[0]['id']
            else:
                # Insert new
                metric_def = self._get_metric_definition(name)
                
                try:
                    insert_response = self.supabase.table('metrics').insert({
                        'name': name,
                        'display_name': metric_def['display_name'],
                        'description': metric_def['description'],
                        'unit': metric_def.get('unit'),
                        'higher_is_better': metric_def.get('higher_is_better', True)
                    }).execute()
                    metric_id = insert_response.data[0]['id']
                    print(f"  Created metric: {name}")
                except Exception as e:
                    # Handle duplicate key error
                    existing_id = self._handle_duplicate_key_error(e, 'metrics', 'name', name)
                    if existing_id:
                        metric_id = existing_id
                    else:
                        raise
            
            with self.cache_lock:
                self.metric_cache[name] = metric_id
            return metric_id
            
        except Exception as e:
            print(f"Error upserting metric '{name}': {e}")
            raise

    def _get_metric_definition(self, name: str) -> Dict[str, Any]:
        """Get metric definition based on name."""
        definitions = {
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
                        'higher_is_better': True
                    },
                    'average_local_error': {
                        'display_name': 'Average Local Error',
                        'description': 'Average attention layer output error',
                        'higher_is_better': False
                    },
                    'overall_score': {
                        'display_name': 'Overall Score',
                        'description': 'Composite performance score for the configuration',
                        'unit': '%',
                        'higher_is_better': True
                    },
                    'average_density': {
                        'display_name': 'Average Density',
                        'description': 'Average attention density across all layers',
                        'unit': '%',
                        'higher_is_better': False
                    },
                    'aux_memory': {
                        'display_name': 'Auxiliary Memory',
                        'description': 'Auxiliary memory usage in bytes per token per KV head',
                        'higher_is_better': False
                    },
                }
                
        return definitions.get(name, {
                    'display_name': name.replace('_', ' ').title(),
                    'description': f"Metric: {name}",
                    'higher_is_better': True
                })

    def upsert_dataset_metric(self, dataset_id: str, metric_id: str, is_primary: bool = True) -> str:
        """Create dataset-metric relationship."""
        cache_key = (dataset_id, metric_id)
        with self.cache_lock:
            if cache_key in self.dataset_metric_cache:
                return self.dataset_metric_cache[cache_key]
        
        try:
            # Try to find existing
            response = self.supabase.table('dataset_metrics').select('id')\
                .eq('dataset_id', dataset_id)\
                .eq('metric_id', metric_id).execute()
            
            if response.data:
                dataset_metric_id = response.data[0]['id']
            else:
                # Insert new
                try:
                    insert_response = self.supabase.table('dataset_metrics').insert({
                        'dataset_id': dataset_id,
                        'metric_id': metric_id,
                        'weight': 1.0,
                        'is_primary': is_primary
                    }).execute()
                    dataset_metric_id = insert_response.data[0]['id']
                except Exception as e:
                    # Handle duplicate key error
                    if 'duplicate key' in str(e):
                        response = self.supabase.table('dataset_metrics').select('id')\
                            .eq('dataset_id', dataset_id)\
                            .eq('metric_id', metric_id).execute()
                        if response.data:
                            dataset_metric_id = response.data[0]['id']
                        else:
                            raise # Re-raise if re-query fails
                    else:
                        raise # Re-raise other errors
            
            with self.cache_lock:
                self.dataset_metric_cache[cache_key] = dataset_metric_id
            return dataset_metric_id
            
        except Exception as e:
            print(f"Error upserting dataset_metric: {e}")
            raise

    def upsert_baseline(self, name: str) -> str:
        """Create or get baseline."""
        with self.cache_lock:
            if name in self.baseline_cache:
                return self.baseline_cache[name]
        
        try:
            # Try to find existing
            response = self.supabase.table('baselines').select('id').eq('name', name).execute()
            
            if response.data:
                baseline_id = response.data[0]['id']
            else:
                # Insert new
                try:
                    insert_response = self.supabase.table('baselines').insert({
                        'name': name,
                        'description': self._get_baseline_description(name),
                        'version': '1.0'
                    }).execute()
                    baseline_id = insert_response.data[0]['id']
                    print(f"  Created baseline: {name}")
                except Exception as e:
                    # Handle duplicate key error
                    existing_id = self._handle_duplicate_key_error(e, 'baselines', 'name', name)
                    if existing_id:
                        baseline_id = existing_id
                    else:
                        raise
            
            with self.cache_lock:
                self.baseline_cache[name] = baseline_id
            return baseline_id
            
        except Exception as e:
            print(f"Error upserting baseline '{name}': {e}")
            raise

    def _get_baseline_description(self, name: str) -> str:
        """Get baseline description based on name."""
        descriptions = {
            'dense': 'Full dense attention (baseline)',
            'OracleTopK': 'Oracle Top-K attention selection',
            'OracleTopP': 'Oracle Top-P attention selection',
            'vAttention(OracleTopK)': 'vAttention: verified Sparse Attention with Oracle Top-K',
            'vAttention(HashAttention)': 'vAttention: verified Sparse Attention with HashAttention',
            'HashAttention': 'HashAttention: Semantic Sparsity for Faster Inference',
            'Quest': 'QUEST: Query-aware Sparsity for Efficient Long-context Transformers',
            'DoubleSparsity': 'Post-Training Sparse Attention with Double Sparsity',
            'PQCache': 'PQCache: Product Quantization-based KVCache for Long Context LLM Inference',
            'vAttention(PQCache)': 'vAttention: verified Sparse Attention with PQCache',
        }
        return descriptions.get(name, f"Sparse attention method: {name}")

    def upsert_llm(self, model_name: str) -> str:
        """Create or get LLM."""
        with self.cache_lock:
            if model_name in self.llm_cache:
                return self.llm_cache[model_name]
        
        try:
            # Try to find existing
            response = self.supabase.table('llms').select('id').eq('name', model_name).execute()
            
            if response.data:
                llm_id = response.data[0]['id']
            else:
                # Insert new
                provider = self.extract_provider_from_model_name(model_name)
                parameter_count = self.extract_parameter_count(model_name)
                
                # Default context length
                context_length = 131072  # 128k default
                if '32k' in model_name.lower():
                    context_length = 32768
                elif '16k' in model_name.lower():
                    context_length = 16384
                
                try:
                    insert_response = self.supabase.table('llms').insert({
                        'name': model_name,
                        'provider': provider,
                        'parameter_count': parameter_count,
                        'context_length': context_length
                    }).execute()
                    llm_id = insert_response.data[0]['id']
                    print(f"  Created LLM: {model_name}")
                except Exception as e:
                    # Handle duplicate key error
                    existing_id = self._handle_duplicate_key_error(e, 'llms', 'name', model_name)
                    if existing_id:
                        llm_id = existing_id
                    else:
                        raise
            
            with self.cache_lock:
                self.llm_cache[model_name] = llm_id
            return llm_id
            
        except Exception as e:
            print(f"Error upserting LLM '{model_name}': {e}")
            raise

    def upsert_configuration(
        self,
        baseline_id: str,
        dataset_id: str,
        llm_id: str,
        target_sparsity: Optional[float],
        config: Dict[str, Any]
    ) -> str:
        """Create or get configuration."""
        # Build cache key
        sparsity_key = target_sparsity if target_sparsity is not None else -1
        cache_key = (baseline_id, dataset_id, llm_id, sparsity_key)
        
        with self.cache_lock:
            if cache_key in self.config_cache:
                config_id = self.config_cache[cache_key]
                self.processed_config_ids.add(config_id)
                return config_id
        
        try:
            # Build query for existing config
            query = self.supabase.table('configurations').select('id')\
                .eq('baseline_id', baseline_id)\
                .eq('dataset_id', dataset_id)\
                .eq('llm_id', llm_id)
            
            # Handle nullable fields
            if target_sparsity is not None:
                query = query.eq('target_sparsity', target_sparsity)
            else:
                query = query.is_('target_sparsity', 'null')
            
            response = query.execute()
            
            if response.data:
                config_id = response.data[0]['id']
            else:
                # Insert new
                try:
                    insert_response = self.supabase.table('configurations').insert({
                        'baseline_id': baseline_id,
                        'dataset_id': dataset_id,
                        'llm_id': llm_id,
                        'target_sparsity': target_sparsity,
                        'additional_params': config  # Stored as JSONB
                    }).execute()
                    config_id = insert_response.data[0]['id']
                except Exception as e:
                    # Handle duplicate key error
                    if 'duplicate key' in str(e):
                        # Re-run query to find the existing config
                        response = query.execute()
                        if response.data:
                            config_id = response.data[0]['id']
                        else:
                            raise # Re-raise if re-query fails
                    else:
                        raise # Re-raise other errors
            
            with self.cache_lock:
                self.config_cache[cache_key] = config_id
                self.processed_config_ids.add(config_id)
            return config_id
            
        except Exception as e:
            print(f"Error upserting configuration: {e}")
            raise

    def batch_insert_results(self, results: List[Dict[str, Any]], batch_size: int = 20, force_push: bool = False):
        """Insert results in batches for better performance."""
        failed_batches = []
        
        try:
            for i in range(0, len(results), batch_size):
                batch = results[i:i+batch_size]
                try:
                    # Use upsert to handle duplicates (insert or update)
                    self.supabase.table('results').upsert(
                        batch,
                        #on_conflict='configuration_id,dataset_metric_id,experimental_run_id'
                    ).execute()
                except Exception as batch_error:
                    if force_push:
                        # Collect failed batches for retry
                        failed_batches.append(batch)
                        print(f"  Batch {i//batch_size + 1} failed, will retry with new experimental_run_id: {str(batch_error)[:100]}")
                    else:
                        raise
            
            return failed_batches
            
        except Exception as e:
            print(f"Error batch inserting results: {e}")
            raise

    def process_record(self, record: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process a single JSONL record and return result records to be batch inserted."""
        try:
            # Extract core fields
            baseline_name = record['baseline']
            model_name = record['model_name']
            benchmark_name = record['benchmark']
            dataset_name = record['dataset']
            config = record.get('config', {})
            
            
            target_density = record["density_target"]
            
            # Per user request, storing DENSITY in the `target_sparsity` column
            # as the UI is interpreting the value as density.
            target_sparsity = target_density
            
            benchmark_metrics = record.get('benchmark_metrics', {})
            
            # Skip if no metrics
            if not benchmark_metrics:
                print(f"  Warning: No benchmark metrics found, skipping")
                return []
            
            # Upsert entities (will use cache if already created sequentially)
            benchmark_id = self.upsert_benchmark(benchmark_name)
            dataset_id = self.upsert_dataset(benchmark_id, dataset_name)
            baseline_id = self.upsert_baseline(baseline_name)
            llm_id = self.upsert_llm(model_name)
            
            # Upsert metrics and dataset-metric relationships (will use cache)
            metric_ids = {}
            for metric_name in benchmark_metrics:
                metric_id = self.upsert_metric(metric_name)
                metric_ids[metric_name] = metric_id
                self.upsert_dataset_metric(dataset_id, metric_id)
            
            # Upsert configuration
            config_id = self.upsert_configuration(
                baseline_id=baseline_id,
                dataset_id=dataset_id,
                llm_id=llm_id,
                target_sparsity=target_sparsity,
                config=config
            )
            
            # Collect results to be batch inserted
            results_to_insert = []
            
            # Add results from benchmark_metrics
            for metric_name, value in benchmark_metrics.items():
                metric_id = metric_ids[metric_name]
                dataset_metric_id = self.dataset_metric_cache[(dataset_id, metric_id)]
                results_to_insert.append({
                    'configuration_id': config_id,
                    'dataset_metric_id': dataset_metric_id,
                    'experimental_run_id': self.experimental_run_id,
                    'value': value
                })
            
            # Also track average_local_error if present
            if 'average_local_error' in record and record['average_local_error'] is not None:
                # Create/get the metric
                error_metric_id = self.upsert_metric('average_local_error')
                # Create dataset-metric relationship
                error_dataset_metric_id = self.upsert_dataset_metric(
                    dataset_id, error_metric_id, is_primary=False
                )
                # Add to results
                results_to_insert.append({
                    'configuration_id': config_id,
                    'dataset_metric_id': error_dataset_metric_id,
                    'experimental_run_id': self.experimental_run_id,
                    'value': record['average_local_error']
                })

            if 'average_density' in record and record['average_density'] is not None:
                # Create/get the metric
                density_metric_id = self.upsert_metric('average_density')
                # Create dataset-metric relationship
                density_dataset_metric_id = self.upsert_dataset_metric(
                    dataset_id, density_metric_id, is_primary=False
                )
                # Add to results, converting fraction to percentage
                results_to_insert.append({
                    'configuration_id': config_id,
                    'dataset_metric_id': density_dataset_metric_id,
                    'experimental_run_id': self.experimental_run_id,
                    'value': record['average_density'] * 100
                })
            
            # Also track overall_score if present
            if 'overall_score' in record and record['overall_score'] is not None:
                # Create/get the metric
                score_metric_id = self.upsert_metric('overall_score')
                # Create dataset-metric relationship
                score_dataset_metric_id = self.upsert_dataset_metric(
                    dataset_id, score_metric_id, is_primary=False
                )
                # Add to results
                results_to_insert.append({
                    'configuration_id': config_id,
                    'dataset_metric_id': score_dataset_metric_id,
                    'experimental_run_id': self.experimental_run_id,
                    'value': record['overall_score']
                })
            
            # Track aux_memory if present
            if 'aux_memory' in record and record['aux_memory'] is not None:
                # Create/get the metric
                aux_memory_metric_id = self.upsert_metric('aux_memory')
                # Create dataset-metric relationship
                aux_memory_dataset_metric_id = self.upsert_dataset_metric(
                    dataset_id, aux_memory_metric_id, is_primary=False
                )
                # Add to results
                results_to_insert.append({
                    'configuration_id': config_id,
                    'dataset_metric_id': aux_memory_dataset_metric_id,
                    'experimental_run_id': self.experimental_run_id,
                    'value': record['aux_memory']
                })
            
            return results_to_insert
            
        except KeyError as e:
            print(f"  Error: Missing required field {e}")
            return []
        except Exception as e:
            print(f"  Error processing record: {e}")
            return []

    def purge_previous_runs(self):
        """Delete all experimental runs and associated data created by this script."""
        print("\n[PURGE] Deleting all previous data uploaded by this script...")
        
        # Get all table names from the schema
        # Delete in order to respect foreign key constraints (child tables first)
        tables_in_order = [
            'results',           # Has FKs to configurations, dataset_metrics, experimental_runs
            'configurations',    # Has FKs to baselines, datasets, llms
            'dataset_metrics',   # Has FKs to datasets, metrics
            'datasets',          # Has FK to benchmarks
            'experimental_runs', # Standalone
            'metrics',           # Standalone
            'baselines',         # Standalone
            'llms',              # Standalone
            'benchmarks'         # Standalone
        ]
        
        for table in tables_in_order:
            print(f"  Deleting  rows from {table}...")
            while True:
                response = self.supabase.table(table).select('id').execute()
                if not response.data:
                    break

                run_ids = [run['id'] for run in response.data]
                
                if not run_ids:
                    print("  No previous experimental runs found to delete.")
                    return

                print(f"  Found {len(run_ids)} experimental runs to delete...")

                # The schema is set up with ON DELETE CASCADE, so deleting a run
                # should cascade to results and configurations.
                # We delete them in batches to be safe.
                for i in range(0, len(run_ids), 50):
                    batch_ids = run_ids[i:i+50]
                    self.supabase.table(table).delete().in_('id', batch_ids).execute()

        print("  Successfully purged all previous upload data.")


    def _create_entities_sequentially(self, records: List[Dict[str, Any]]):
        """
        Create all entities (benchmarks, datasets, metrics, baselines, LLMs)
        sequentially from *all* records to populate cache and avoid race conditions.
        """
        print("\n[2/4] Creating all required entities sequentially...")

        # Use sets to avoid redundant upserts
        benchmarks_to_create = set()
        datasets_to_create = set()
        metrics_to_create = set()
        baselines_to_create = set()
        llms_to_create = set()
        
        for record in records:
            try:
                benchmarks_to_create.add(record['benchmark'])
                baselines_to_create.add(record['baseline'])
                llms_to_create.add(record['model_name'])
                metrics_to_create.update(record.get('benchmark_metrics', {}).keys())
                if 'average_local_error' in record and record['average_local_error'] is not None:
                    metrics_to_create.add('average_local_error')
                if 'average_density' in record and record['average_density'] is not None:
                    metrics_to_create.add('average_density')
                if 'overall_score' in record and record['overall_score'] is not None:
                    metrics_to_create.add('overall_score')
                if 'aux_memory' in record and record['aux_memory'] is not None:
                    metrics_to_create.add('aux_memory')
            except KeyError:
                continue # Skip records with missing essential data
        
        # Create entities in dependency order
        print(f"  Found {len(benchmarks_to_create)} benchmarks")
        for name in benchmarks_to_create: self.upsert_benchmark(name)
        
        print(f"  Found {len(baselines_to_create)} baselines")
        for name in baselines_to_create: self.upsert_baseline(name)
        
        print(f"  Found {len(llms_to_create)} LLMs")
        for name in llms_to_create: self.upsert_llm(name)
        
        print(f"  Found {len(metrics_to_create)} metrics")
        for name in metrics_to_create: self.upsert_metric(name)

        # Datasets and dataset_metrics depend on benchmarks and metrics
        print("  Scanning for datasets and dataset-metric links...")
        for record in records:
            try:
                benchmark_id = self.benchmark_cache.get(record['benchmark'])
                if not benchmark_id: continue
                
                dataset_id = self.upsert_dataset(benchmark_id, record['dataset'])
                
                for metric_name in record.get('benchmark_metrics', {}).keys():
                    metric_id = self.metric_cache.get(metric_name)
                    if metric_id:
                        self.upsert_dataset_metric(dataset_id, metric_id, is_primary=True)
                
                if 'average_local_error' in record and record['average_local_error'] is not None:
                    metric_id = self.metric_cache.get('average_local_error')
                    if metric_id:
                        self.upsert_dataset_metric(dataset_id, metric_id, is_primary=False)

                if 'average_density' in record and record['average_density'] is not None:
                    metric_id = self.metric_cache.get('average_density')
                    if metric_id:
                        self.upsert_dataset_metric(dataset_id, metric_id, is_primary=False)

                if 'overall_score' in record and record['overall_score'] is not None:
                    metric_id = self.metric_cache.get('overall_score')
                    if metric_id:
                        self.upsert_dataset_metric(dataset_id, metric_id, is_primary=False)

                if 'aux_memory' in record and record['aux_memory'] is not None:
                    metric_id = self.metric_cache.get('aux_memory')
                    if metric_id:
                        self.upsert_dataset_metric(dataset_id, metric_id, is_primary=False)
            except Exception:
                continue # Continue processing other records

        print("  All entities created/cached successfully")

    def upload_data(
        self, 
        jsonl_filepath: str, 
        dry_run: bool = False, 
        limit: Optional[int] = None, 
        experimental_run_name: Optional[str] = None,
        resume: int = 0,
        force_push: bool = False,
        models: Optional[List[str]] = None,
        baselines: Optional[List[str]] = None
    ) -> int:
        """
        Main upload process, now fully sequential.
        
        Args:
            jsonl_filepath: Path to JSONL file with records
            dry_run: If True, only analyze without uploading
            limit: Process only first N records (after filtering/resume)
            experimental_run_name: Name for the experimental run
            resume: Skip first N records
            force_push: Retry failed batches with new experimental_run_ids (max 10 retries)
            models: Filter to only upload records for specific models (None = all)
            baselines: Filter to only upload records for specific baselines (None = all)
        
        Returns:
            Number of successfully processed records
        """
        print("=" * 60)
        print("Sky Light Data Upload to Supabase (Sequential Mode)")
        print("=" * 60)
        
        # Parse JSONL file
        print(f"\n[1/4] Parsing JSONL file: {jsonl_filepath}")
        records = self.parse_jsonl(jsonl_filepath)
        total_in_file = len(records)
        
        if dry_run:
            print("\n[DRY RUN] No data will be uploaded")
            print(f"Found {total_in_file} records to process")
            analyze_jsonl_file(Path(jsonl_filepath))
            return total_in_file
        
        # Create experimental run
        print("\n[2/4] Creating experimental run...")
        self.experimental_run_id = self.create_experimental_run(experimental_run_name)
        
        # Create all entities sequentially from ALL records to populate cache
        # This ensures all foreign keys exist regardless of limit/resume
        self._create_entities_sequentially(records)

        # Apply filters for models and baselines
        print(f"\n[3/4] Preparing to process records...")
        
        # Filter by models and baselines if specified
        filtered_records = records
        if models is not None:
            print(f"  Filtering for models: {', '.join(models)}")
            filtered_records = [r for r in filtered_records if r.get('model_name') in models]
            print(f"  After model filter: {len(filtered_records)} records")
        
        if baselines is not None:
            print(f"  Filtering for baselines: {', '.join(baselines)}")
            filtered_records = [r for r in filtered_records if r.get('baseline') in baselines]
            print(f"  After baseline filter: {len(filtered_records)} records")
        
        # Apply resume and limit
        if resume > 0:
            print(f"  Resuming from record index {resume} (skipping {resume} records)")
        if limit is not None:
            print(f"  Limiting to {limit} records")

        records_to_process = filtered_records[resume:]
        if limit is not None:
            records_to_process = records_to_process[:limit]
        
        total_to_process = len(records_to_process)
        if total_to_process == 0:
            print("  No records to process after applying resume/limit.")
        else:
            print(f"  Will process {total_to_process} records (from file index {resume} to {resume + total_to_process - 1}).")

        # Process records sequentially and collect results for batch insertion
        print(f"\n[4/4] Processing records and collecting results...")
        success_count = 0
        failed_records = []
        all_results = []
        batch_size = 100  # Insert every 100 records

        for i, record in enumerate(records_to_process):
            # 1-based index in the *original* file
            current_index = i + resume + 1 
            
            # Extract display info
            baseline = record['baseline']
            dataset = record.get('dataset', 'unknown')
            model = record.get('model_name', 'unknown')
            
            try:
                # This call will now return a list of result dictionaries
                results = self.process_record(record)
                
                if results:
                    success_count += 1
                    all_results.extend(results)
                    status = "✓"
                else:
                    status = "✗"
                    failed_records.append((current_index, record))
                
                # Progress update
                print(f"[{i+1}/{total_to_process}] (File #{current_index}) {status} {baseline} on {dataset} with {model}")
                
                # Batch insert every batch_size records
                if len(all_results) >= batch_size * 10:  # 10 results per record avg
                    print(f"  Batch inserting {len(all_results)} results...")
                    self.batch_insert_results(all_results, force_push=force_push)
                    all_results = []
            
            except Exception as e:
                failed_records.append((current_index, record))
                print(f"[{i+1}/{total_to_process}] (File #{current_index}) ✗ {baseline} on {dataset} with {model} - CRITICAL Error: {str(e)}")
        
        # Insert any remaining results
        failed_batches = []
        if all_results:
            print(f"\nInserting final batch of {len(all_results)} results...")
            failed_batches = self.batch_insert_results(all_results, force_push=force_push)
        
        # If force_push is enabled and there are failed batches, retry with new experimental_run_ids
        if force_push and failed_batches:
            print(f"\n[FORCE PUSH] Retrying {len(failed_batches)} failed batches with new experimental_run_ids...")
            retry_count = 0
            max_retries = 10
            
            while failed_batches and retry_count < max_retries:
                retry_count += 1
                print(f"\n  Retry attempt {retry_count}/{max_retries} with {len(failed_batches)} batches...")
                
                # Create a new experimental run for retry
                retry_run_id = self.create_experimental_run(f"{experimental_run_name or 'Upload'} (Retry {retry_count})")
                
                # Update all failed batches with the new experimental_run_id
                batches_to_retry = failed_batches
                failed_batches = []
                
                for batch in batches_to_retry:
                    # Update experimental_run_id for each result in the batch
                    updated_batch = []
                    for result in batch:
                        updated_result = result.copy()
                        updated_result['experimental_run_id'] = retry_run_id
                        updated_batch.append(updated_result)
                    
                    # Try to insert the updated batch
                    try:
                        self.supabase.table('results').upsert(
                            updated_batch,
                            #on_conflict='configuration_id,dataset_metric_id,experimental_run_id'
                        ).execute()
                        print(f"    ✓ Batch successfully inserted with experimental_run_id: {retry_run_id}")
                    except Exception as e:
                        # Still failed, add to failed_batches for next retry
                        failed_batches.append(updated_batch)
                        print(f"    ✗ Batch still failed: {str(e)[:100]}")
                
                if not failed_batches:
                    print(f"\n  All batches successfully pushed after {retry_count} retry(ies)!")
                    break
            
            if failed_batches:
                print(f"\n  WARNING: {len(failed_batches)} batches still failed after {max_retries} retries")
        
        # Flatten failed_batches to count individual results
        total_failed_results = sum(len(batch) for batch in failed_batches) if failed_batches else 0
        
        # Print summary
        print("\n" + "=" * 60)
        print("Upload Summary")
        print("=" * 60)
        print(f"Total records in file: {total_in_file}")
        if models is not None:
            print(f"Filtered for models: {', '.join(models)}")
        if baselines is not None:
            print(f"Filtered for baselines: {', '.join(baselines)}")
        print(f"Total records processed: {total_to_process}")
        print(f"Successful: {success_count}")
        print(f"Failed: {len(failed_records)}")
        if force_push and total_failed_results > 0:
            print(f"Results still failed after force-push retries: {total_failed_results}")

        if failed_records:
            print(f"\nFailed records (first 10):")
            for idx, record in failed_records[:10]:
                print(f"  - Record #{idx}: {record.get('baseline', 'unknown')} on {record.get('dataset', 'unknown')}")

        print(f"\nEntities created/found in cache:")
        print(f"  Benchmarks: {len(self.benchmark_cache)}")
        print(f"  Datasets: {len(self.dataset_cache)}")
        print(f"  Metrics: {len(self.metric_cache)}")
        print(f"  Baselines: {len(self.baseline_cache)}")
        print(f"  LLMs: {len(self.llm_cache)}")
        print(f"  Configurations: {len(self.config_cache)}")

        return success_count


def analyze_jsonl_file(filepath: Path):
    """Analyze JSONL file and show what would be extracted."""
    print("=" * 80)
    print("JSONL File Analysis")
    print("=" * 80)
    
    # Create a dummy uploader just to use the parsing methods
    class DummyUploader(SupabaseUploader):
        def __init__(self):
            # Don't initialize Supabase client
            self.benchmark_cache = {}
            self.dataset_cache = {}
            self.metric_cache = {}
            self.baseline_cache = {}
            self.llm_cache = {}
            self.config_cache = {}
            self.dataset_metric_cache = {}
            # No need for locks or supabase client
    
    uploader = DummyUploader()
    records = uploader.parse_jsonl(str(filepath))
    
    # Analyze records
    baselines = defaultdict(int)
    models = defaultdict(int)
    benchmarks = defaultdict(int)
    datasets = defaultdict(int)
    metrics = set()
    
    print(f"\nAnalyzing {len(records)} records...")
    
    # First, collect statistics from ALL records
    for record in records:
        baseline = record['baseline']
        model = record['model_name']
        benchmark = record['benchmark']
        dataset = record['dataset']
        
        baselines[baseline] += 1
        models[model] += 1
        benchmarks[benchmark] += 1
        datasets[dataset] += 1
        metrics.update(record.get('benchmark_metrics', {}).keys())
    
    # Show sample analysis
    print("\nSample record analysis (first 5):")
    print("-" * 80)
    
    for i, record in enumerate(records[:5]):
        print(f"\nRecord {i+1}:")
        
        # Extract values
        baseline = record['baseline']
        model = record['model_name']
        benchmark = record['benchmark']
        dataset = record['dataset']
        aux_memory = record['aux_memory']
        target_density = record["density_target"]
        target_sparsity = 100.0 - target_density if target_density is not None else 'None'
        
        print(f"  Model: {model}")
        print(f"  Baseline: {baseline} (raw: {record.get('baseline', 'N/A')})")
        print(f"  Benchmark: {benchmark}")
        print(f"  Dataset: {dataset}")
        print(f"  Target Density: {target_density}% -> Sparsity: {target_sparsity}%")
        print(f"  Aux Memory: {aux_memory}")
        print(f"  Metrics: {list(record.get('benchmark_metrics', {}).keys())}")
    
    # Print summary statistics
    print("\n" + "=" * 80)
    print("Summary Statistics")
    print("=" * 80)
    
    print(f"\nUnique Baselines ({len(baselines)}):")
    for baseline, count in sorted(baselines.items()):
        print(f"  {baseline}: {count} records")
    
    print(f"\nUnique Models ({len(models)}):")
    for model, count in sorted(models.items()):
        print(f"  {model}: {count} records")
    
    print(f"\nUnique Benchmarks ({len(benchmarks)}):")
    for benchmark, count in sorted(benchmarks.items()):
        print(f"  {benchmark}: {count} records")
    
    print(f"\nUnique Datasets ({len(datasets)}):")
    for dataset, count in sorted(datasets.items()):
        print(f"  {dataset}: {count} records")
    
    print(f"\nUnique Metrics ({len(metrics)}):")
    for metric in sorted(metrics):
        print(f"  {metric}")
    
    # Check for any missing required fields
    print("\n" + "=" * 80)
    print("Data Validation")
    print("=" * 80)
    
    missing_fields = defaultdict(int)
    for i, record in enumerate(records):
        required_fields = ['model_name', 'baseline', 'benchmark', 'dataset', 'benchmark_metrics']
        for field in required_fields:
            if field not in record or not record[field]:
                missing_fields[field] += 1
    
    if missing_fields:
        print("\nRecords with missing required fields:")
        for field, count in missing_fields.items():
            print(f"  {field}: {count} records")
    else:
        print("\nAll records have required fields ✓")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Upload leaderboard data to Supabase')
    parser.add_argument(
        '--file', 
        type=str,
        default=None,
        help='Path to JSONL file with records'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be uploaded without actually uploading'
    )
    parser.add_argument(
        '--experimental-run-name',
        type=str,
        default="base_experiment",
        help='Name of the experimental run'
    )
    parser.add_argument(
        '--limit',
        type=int,
        default=None,
        help='Process only the first N records (after skipping)'
    )
    parser.add_argument(
        '--resume',
        type=int,
        default=0,
        help='Skip the first N records and resume processing (0-indexed)'
    )
    parser.add_argument(
        '--purge',
        action='store_true',
        help='Delete all data from previous script uploads before running'
    )
    parser.add_argument(
        '--force-push',
        action='store_true',
        help='Retry failed batches with new experimental_run_ids (max 10 retries)'
    )
    parser.add_argument(
        '--models',
        type=str,
        nargs='+',
        default=None,
        help='Filter to only upload records for specific models (space-separated list)'
    )
    parser.add_argument(
        '--baselines',
        type=str,
        nargs='+',
        default=None,
        help='Filter to only upload records for specific baselines (space-separated list)'
    )
    
    args = parser.parse_args()

    # Get Supabase credentials from environment
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Error: Missing environment variables!")
        print("Please set SUPABASE_URL and SUPABASE_KEY:")
        print("  export SUPABASE_URL='https://your-project.supabase.co'")
        print("  export SUPABASE_KEY='your-anon-key'")
        sys.exit(1)
    
    
    # Create uploader and run
    try:
        uploader = SupabaseUploader(supabase_url, supabase_key)

        if args.purge:
            uploader.purge_previous_runs()

        if args.file is None:
            print("No file provided")
            sys.exit(0)

        # Check if file exists
        jsonl_path = Path(args.file)
        if not jsonl_path.exists():
            print(f"Error: File not found: {jsonl_path}")
            sys.exit(1)

        success_count = uploader.upload_data(
            str(jsonl_path), 
            experimental_run_name=args.experimental_run_name,
            dry_run=args.dry_run,
            limit=args.limit,
            resume=args.resume,
            force_push=args.force_push,
            models=args.models,
            baselines=args.baselines
        )

        if args.dry_run:
            print("\n[DRY RUN COMPLETE] No data was uploaded")
        elif not args.purge:
            print(f"\nUpload completed successfully! Processed {success_count} records.")
        else:
            print(f"\nPurge and upload completed successfully! Processed {success_count} records.")
            
    except Exception as e:
        print(f"\nError during upload: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
