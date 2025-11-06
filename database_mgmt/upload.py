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
import argparse
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
        # Track processed configurations for keep-only cleanup
        self.processed_config_ids: Set[str] = set()

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
        """Extract provider from model name (e.g., 'meta-llama/...' -> 'meta')."""
        provider_map = {
            'meta-llama': 'meta',
            'meta': 'meta',
            'qwen': 'qwen',
            'openai': 'openai',
            'anthropic': 'anthropic',
            'google': 'google',
            'mistralai': 'mistral ai',
        }
        
        model_lower = model_name.lower()
        for key, value in provider_map.items():
            if key in model_lower:
                return value
        
        # Fallback: use first part before slash or full name, lowercased
        if '/' in model_name:
            return model_name.split('/')[0].lower()
        return 'unknown'

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

    def infer_group_name(self, record: Dict[str, Any]) -> Optional[str]:
        """
        Infer method/group name from config params instead of relying on the
        'baseline' field, which can be misleading.

        Mapping (priority-ordered):
        - 'vattention + hat'         if baseline contains 'vAttention' and any params have 'hat_bits'
        - 'vattention + oracle-topk' if baseline contains 'vAttention' otherwise
        - 'hash_attention'           if 'hat_bits' present in any params
        - 'oracle-topp'              if 'top_p' present in generation params
        - 'quest'                    if 'page_size' is present in any params
        - 'magic_pig'                if 'lsh_l' is present in any params
        - 'double_sparsity'          if 'group_factor' is present in any params

        Returns a best-effort label. If no mapping applies:
        - returns 'oracle-topk' when baseline contains 'oracle-topk'
        - otherwise returns 'dense'
        """
        try:
            cfg = record.get('config') or {}
            sa_cfg = (cfg.get('sparse_attention_config') or {})
            masker_cfgs = sa_cfg.get('masker_configs') or []
            gen_cfg = (cfg.get('generation_kwargs') or {})

            # Check params across all masker configs in priority order
            baseline_raw = (record.get('baseline') or '')
            if 'vattention' in baseline_raw.lower():
                for mc in masker_cfgs:
                    params = (mc or {}).get('params') or {}
                    if 'hat_bits' in params:
                        return 'vattention + hat'
                return 'vattention + oracle-topk'
            for mc in masker_cfgs:
                params = (mc or {}).get('params') or {}
                if 'hat_bits' in params:
                    return 'hash_attention'
            # Check generation params for top-p
            if 'top_p' in gen_cfg:
                return 'oracle-topp'
            for mc in masker_cfgs:
                params = (mc or {}).get('params') or {}
                if 'page_size' in params:
                    return 'quest'
            for mc in masker_cfgs:
                params = (mc or {}).get('params') or {}
                if 'lsh_l' in params:
                    return 'magic_pig'
            for mc in masker_cfgs:
                params = (mc or {}).get('params') or {}
                if 'group_factor' in params:
                    return 'double_sparsity'
        except Exception:
            # Fall through to string-based fallback
            pass

        # Final fallback by baseline label
        baseline_fallback = (record.get('baseline') or '').lower()
        if 'oracle-topk' in baseline_fallback:
            return 'oracle-topk'
        return 'dense'

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
            # Track processed configuration id
            if config_id:
                self.processed_config_ids.add(config_id)
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
            # Prefer inferred group/method name from config params; fallback to provided baseline
            baseline_name = self.infer_group_name(record) or record['baseline']
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
                # Mirror display name with the same inference used for upsert
                display_baseline = self.infer_group_name(record) or record.get('baseline')
                print(f"\nProcessing record {idx}/{total}: {display_baseline} on {record['dataset']} with {record['model_name']}")
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

    def keep_only_cleanup(self, provider_filter: Optional[str] = None):
        """
        In keep-only mode, delete configurations (and their results) that are NOT
        in self.processed_config_ids. If provider_filter is provided, restrict
        deletions to LLMs with that provider (case-insensitive).
        """
        try:
            provider_filter_norm = provider_filter.lower() if provider_filter else None

            llm_ids_scope: Optional[Set[str]] = None
            if provider_filter_norm:
                # Fetch LLMs matching provider
                llm_resp = self.supabase.table('llms').select('id, provider').execute()
                llm_ids_scope = set(
                    row['id'] for row in (llm_resp.data or [])
                    if (row.get('provider') or '').lower() == provider_filter_norm
                )

            # Fetch configurations in scope
            query = self.supabase.table('configurations').select('id, llm_id')
            if llm_ids_scope:
                # Supabase-py supports in_ filter
                query = query.in_('llm_id', list(llm_ids_scope))
            conf_resp = query.execute()

            existing_ids = set(row['id'] for row in (conf_resp.data or []))
            to_delete_ids = existing_ids - self.processed_config_ids

            if not to_delete_ids:
                print("No configurations to delete in keep-only cleanup.")
                return

            print(f"Keep-only: deleting {len(to_delete_ids)} configurations not in input file")

            # Delete results first (FK)
            for cid in to_delete_ids:
                self.supabase.table('results').delete().eq('configuration_id', cid).execute()
            # Delete configurations
            for cid in to_delete_ids:
                self.supabase.table('configurations').delete().eq('id', cid).execute()

            print("Keep-only cleanup complete.")
        except Exception as e:
            print(f"Error during keep-only cleanup: {e}")
            raise


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Upload leaderboard data to Supabase')
    parser.add_argument('--file', type=str, help='Path to JSONL file with records')
    parser.add_argument('--keep-only', action='store_true', help='Delete configurations not present in the provided file')
    parser.add_argument('--model-provider', type=str, default=None, help='Restrict keep-only deletions to a specific LLM provider (e.g., Meta, Qwen)')
    parser.add_argument('--upload-provider', type=str, default=None, help='Filter input records to a specific provider for upload (e.g., Meta, Qwen)')
    parser.add_argument('--model-contains', type=str, default=None, help='Filter input records by substring in model_name')
    parser.add_argument('--dry-run', action='store_true', help='Simulation mode: do not write to DB; only print what would happen')
    parser.add_argument('--keep-only-results-strict', action='store_true', help='Also prune results for kept configs to only the current run')
    parser.add_argument('--debug', action='store_true', help='Print duplicate configuration groups based on (baseline,dataset,model,sparsity,aux) mapping')
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
    
    # Resolve JSONL file path
    script_dir = Path(__file__).parent
    jsonl_path = Path(args.file) if args.file else (script_dir / 'experiments.jsonl')
    
    if not jsonl_path.exists():
        print(f"Error: JSONL file not found at {jsonl_path}")
        sys.exit(1)
    
    # Create uploader and run
    uploader = SupabaseUploader(supabase_url, supabase_key)

    # If filtering input or running a dry-run, pre-parse and handle records
    if args.dry_run or args.model_contains or args.model_provider or args.upload_provider:
        # Custom read to filter then process
        records = uploader.parse_jsonl(str(jsonl_path))

        # Filter by model substring if provided
        if args.model_contains:
            substr = args.model_contains.lower()
            records = [r for r in records if substr in (r.get('model_name') or '').lower()]
            print(f"Filtered to {len(records)} records by model substring: '{args.model_contains}'")

        # Filter uploads by provider if requested
        if args.upload_provider:
            provider_norm = args.upload_provider.lower()
            def rec_is_provider(rec):
                provider = uploader.extract_provider_from_model_name(rec.get('model_name') or '')
                return (provider or '').lower() == provider_norm
            before = len(records)
            records = [r for r in records if rec_is_provider(r)]
            print(f"Filtered to {len(records)} records by upload provider: '{args.upload_provider}' (from {before})")
        # Helper to build configuration signature used for de-duplication
        def rec_signature(rec):
            baseline_name = uploader.infer_group_name(rec) or (rec.get('baseline') or '')
            dataset_name = rec.get('dataset') or ''
            llm_name = rec.get('model_name') or ''
            sparsity = uploader.extract_sparsity_from_record(rec)
            aux_mem = rec.get('aux_memory')
            sparsity_key = sparsity if sparsity is not None else -1
            aux_key = aux_mem if aux_mem is not None else -1
            return (baseline_name, dataset_name, llm_name, sparsity_key, aux_key)

        # Debug: show duplicates
        if args.debug:
            from collections import defaultdict
            sig_to_indices = defaultdict(list)
            for idx, rec in enumerate(records, 1):
                sig_to_indices[rec_signature(rec)].append(idx)
            dup_groups = [(sig, idxs) for sig, idxs in sig_to_indices.items() if len(idxs) > 1]
            print(f"[DEBUG] Found {len(dup_groups)} duplicate configuration groups (same signature across multiple records)")
            for sig, idxs in dup_groups:
                b, d, m, s, a = sig
                print(f"[DEBUG] x{len(idxs)}  baseline='{b}', dataset='{d}', model='{m}', target_sparsity={s}, target_aux_memory={a}; records={idxs}")

        if args.dry_run:
            print("\n[DRY-RUN] Simulating upload...")
            # Build signatures of what would be kept
            processed_signatures = {rec_signature(r) for r in records}
            print(f"[DRY-RUN] Would process {len(records)} records; unique configurations: {len(processed_signatures)}")

            if args.keep_only:
                print("[DRY-RUN] Computing keep-only deletions...")
                # Build existing config signatures from DB
                # Fetch maps for id -> name
                bl = uploader.supabase.table('baselines').select('id, name').execute()
                ds = uploader.supabase.table('datasets').select('id, name').execute()
                ll = uploader.supabase.table('llms').select('id, name').execute()
                bl_map = {row['id']: row['name'] for row in (bl.data or [])}
                ds_map = {row['id']: row['name'] for row in (ds.data or [])}
                ll_map = {row['id']: row['name'] for row in (ll.data or [])}

                conf_q = uploader.supabase.table('configurations').select('id, baseline_id, dataset_id, llm_id, target_sparsity, target_aux_memory')
                conf_resp = conf_q.execute()
                existing_signatures = set()
                for row in (conf_resp.data or []):
                    baseline_name = bl_map.get(row['baseline_id'], '')
                    dataset_name = ds_map.get(row['dataset_id'], '')
                    llm_name = ll_map.get(row['llm_id'], '')
                    sparsity_key = float(row['target_sparsity']) if row['target_sparsity'] is not None else -1
                    aux_key = row['target_aux_memory'] if row['target_aux_memory'] is not None else -1
                    existing_signatures.add((baseline_name, dataset_name, llm_name, sparsity_key, aux_key))

                to_delete = existing_signatures - processed_signatures
                print(f"[DRY-RUN] Would delete {len(to_delete)} configurations not in input file")

            print("[DRY-RUN] No changes have been made.")
        else:
            # Real upload path
            print("\n[2/3] Creating experimental run...")
            uploader.experimental_run_id = uploader.create_experimental_run()
            print("\n[3/3] Processing records...")
            total = len(records)
            for idx, record in enumerate(records, 1):
                try:
                    display_baseline = uploader.infer_group_name(record) or record.get('baseline')
                    print(f"\nProcessing record {idx}/{total}: {display_baseline} on {record['dataset']} with {record['model_name']}")
                    uploader.process_record(record)
                    print(f"  ✓ Successfully processed")
                except Exception as e:
                    print(f"  ✗ Failed: {e}")
                    continue
    else:
        uploader.upload_data(str(jsonl_path))

    # Keep-only cleanup if requested
    if args.keep_only and not args.dry_run:
        uploader.keep_only_cleanup(provider_filter=args.model_provider)
        if args.keep_only_results_strict and uploader.experimental_run_id:
            # Delete results for kept configurations that are not from this run
            try:
                print("Pruning results for kept configurations to only current run...")
                # Find kept configuration ids
                conf_resp = uploader.supabase.table('configurations').select('id').execute()
                kept_ids = set(row['id'] for row in (conf_resp.data or [])) & uploader.processed_config_ids
                if kept_ids:
                    # Supabase-py doesn't support NOT EQUAL with set directly; delete per chunk
                    run_id = uploader.experimental_run_id
                    for cid in kept_ids:
                        # Delete all results for this config that are not from current run
                        uploader.supabase.table('results').delete().eq('configuration_id', cid).neq('experimental_run_id', run_id).execute()
                    print("Results pruning complete.")
                else:
                    print("No kept configurations found for results pruning.")
            except Exception as e:
                print(f"Error during results pruning: {e}")


if __name__ == '__main__':
    main()

