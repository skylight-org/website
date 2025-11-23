#!/usr/bin/env python3
"""
Combined View Script for Sky Light leaderboard.

This script computes a combined baseline ranking table by aggregating ranks
from all individual baseline views (across all LLMs and target sparsities).

For each baseline, it computes the average rank across all individual tables,
providing an overall performance metric.

Usage:
    export SUPABASE_URL="https://your-project.supabase.co"
    export SUPABASE_KEY="your-anon-key"
    
    # All LLMs and sparsities
    python combinedview.py
    
    # Filter by specific LLMs
    python combinedview.py --llms "meta-llama/Llama-3.2-3B-Instruct" "Qwen/Qwen2.5-7B-Instruct"
    
    # Filter by specific sparsities
    python combinedview.py --sparsities 5.0 10.0
    
    # Filter by both
    python combinedview.py --llms "meta-llama/Llama-3.2-3B-Instruct" --sparsities 5.0 10.0
    
    # Use more parallel workers for faster computation
    python combinedview.py --workers 8
    
    # Use different metric
    python combinedview.py --metric average_local_error
    python combinedview.py --metric overall_score  # default
    
    # Export results
    python combinedview.py --output json --file combined_results.json
    python combinedview.py --output csv --file combined_results.csv
"""

import os
import sys
import argparse
import json
import threading
from typing import Dict, List, Optional, Any, Tuple
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    from supabase import create_client, Client
except ImportError:
    print("Error: supabase-py not installed. Run: pip install supabase")
    sys.exit(1)


class CombinedViewGenerator:
    """Generates combined baseline ranking view from Supabase database."""

    def __init__(self, supabase_url: str, supabase_key: str):
        """Initialize Supabase client."""
        self.supabase: Client = create_client(supabase_url, supabase_key)

    def get_all_llms(self) -> List[Tuple[str, str]]:
        """Get all LLMs from database. Returns list of (id, name) tuples."""
        try:
            response = self.supabase.table('llms').select('id, name').execute()
            return [(llm['id'], llm['name']) for llm in response.data]
        except Exception as e:
            print(f"Error querying LLMs: {e}")
            return []

    def get_all_target_sparsities(self) -> List[float]:
        """Get all unique target_sparsity values from configurations."""
        try:
            # Query distinct target_sparsity values
            response = self.supabase.table('configurations')\
                .select('target_sparsity')\
                .execute()
            
            # Extract unique non-null sparsities
            sparsities = set()
            for config in response.data:
                if config['target_sparsity'] is not None:
                    sparsities.add(float(config['target_sparsity']))
            
            return sorted(list(sparsities))
        except Exception as e:
            print(f"Error querying target sparsities: {e}")
            return []

    def get_baseline_ranking_for_llm_sparsity(
        self,
        llm_id: str,
        llm_name: str,
        target_sparsity: float,
        metric_name: str = 'overall_score'
    ) -> Dict[str, Dict[str, Any]]:
        """
        Get baseline rankings for a specific LLM and target_sparsity.
        
        Args:
            llm_id: LLM identifier
            llm_name: LLM name
            target_sparsity: Target sparsity value
            metric_name: Metric to rank by (e.g., 'overall_score', 'average_local_error')
        
        Returns:
            Dict mapping baseline_name to {'rank': int, 'score': float, 'metric_value': float}
            Only includes baselines that have a valid rank.
        """
        try:
            # Get the metric ID and properties
            metric_response = self.supabase.table('metrics')\
                .select('id, higher_is_better')\
                .eq('name', metric_name)\
                .execute()
            
            if not metric_response.data:
                return {}
            
            metric_id = metric_response.data[0]['id']
            higher_is_better = metric_response.data[0]['higher_is_better']

            # Get all baselines
            baselines_response = self.supabase.table('baselines')\
                .select('id, name')\
                .execute()
            
            if not baselines_response.data:
                return {}
            
            baselines = {b['id']: b['name'] for b in baselines_response.data}
            
            # For each baseline, compute average overall_score
            baseline_scores = []
            
            for baseline_id, baseline_name in baselines.items():
                # Special handling for dense baseline
                is_dense = baseline_name.lower() == 'dense'
                
                if is_dense:
                    # For dense, get all configurations for this baseline + LLM
                    configs_response = self.supabase.table('configurations')\
                        .select('id, dataset_id')\
                        .eq('baseline_id', baseline_id)\
                        .eq('llm_id', llm_id)\
                        .execute()
                else:
                    # For other baselines, filter by target_sparsity
                    configs_response = self.supabase.table('configurations')\
                        .select('id, dataset_id')\
                        .eq('baseline_id', baseline_id)\
                        .eq('llm_id', llm_id)\
                        .eq('target_sparsity', target_sparsity)\
                        .execute()
                
                if not configs_response.data:
                    continue
                
                # Get overall_scores for each configuration
                overall_scores = []
                
                for config in configs_response.data:
                    config_id = config['id']
                    dataset_id = config['dataset_id']
                    
                    # Get the dataset_metric_id
                    dm_response = self.supabase.table('dataset_metrics')\
                        .select('id')\
                        .eq('dataset_id', dataset_id)\
                        .eq('metric_id', metric_id)\
                        .execute()
                    
                    if dm_response.data:
                        dataset_metric_id = dm_response.data[0]['id']
                        
                        # Get the result value
                        result_response = self.supabase.table('results')\
                            .select('value')\
                            .eq('configuration_id', config_id)\
                            .eq('dataset_metric_id', dataset_metric_id)\
                            .execute()
                        
                        if result_response.data:
                            score = float(result_response.data[0]['value'])
                            overall_scores.append(score)
                
                # Compute average
                if overall_scores:
                    avg_score = sum(overall_scores) / len(overall_scores)
                    baseline_scores.append({
                        'name': baseline_name,
                        'score': avg_score
                    })
            
            # Sort by score (direction depends on higher_is_better)
            baseline_scores.sort(key=lambda x: x['score'], reverse=higher_is_better)
            
            # Find dense baseline score for calculations
            dense_score = None
            for baseline in baseline_scores:
                if baseline['name'].lower() == 'dense':
                    dense_score = baseline['score']
                    break
            
            # Create result dict with ranks and metric-specific value
            result = {}
            for i, baseline in enumerate(baseline_scores, 1):
                baseline_data = {
                    'rank': i,
                    'score': baseline['score']
                }
                
                # Calculate % gap relative to dense (unified for all metrics)
                # For overall_score: dense is ~92%, baseline is ~85% → gap is negative
                # For average_local_error: dense is ~0%, baseline is ~2.4% → gap is positive
                if dense_score is not None and dense_score > 0:
                    # % gap = (baseline - dense) / dense * 100
                    baseline_data['metric_value'] = ((baseline['score'] - dense_score) / dense_score) * 100
                else:
                    # If dense is 0 (like for errors), just show the value as percentage
                    baseline_data['metric_value'] = baseline['score'] * 100
                
                result[baseline['name']] = baseline_data
            
            return result
            
        except Exception as e:
            print(f"Error getting rankings for {llm_name} @ {target_sparsity}%: {e}")
            return {}

    def compute_combined_ranking(
        self,
        filter_llms: Optional[List[str]] = None,
        filter_sparsities: Optional[List[float]] = None,
        max_workers: int = 1, # multiple sometimes crashes
        metric_name: str = 'overall_score'
    ) -> List[Dict[str, Any]]:
        """
        Compute combined ranking across LLMs and target sparsities.
        
        Args:
            filter_llms: Optional list of LLM names to include. If None, uses all LLMs.
            filter_sparsities: Optional list of target sparsities to include. If None, uses all.
            max_workers: Number of parallel workers for table computation (default: 4).
            metric_name: Metric to rank by (e.g., 'overall_score', 'average_local_error').
        
        For each baseline:
        - Get its rank from each individual table (LLM × target_sparsity)
        - Compute average rank
        - Rank baselines by average rank (lower is better)
        
        Returns:
            List of dicts with: rank, baseline_name, avg_rank, num_tables
        """
        print("\n" + "=" * 80)
        print("Computing Combined Baseline Rankings")
        print("=" * 80)
        
        # Get all LLMs and sparsities
        all_llms = self.get_all_llms()
        all_sparsities = self.get_all_target_sparsities()
        
        # Apply filters if specified
        if filter_llms:
            llms = [(llm_id, llm_name) for llm_id, llm_name in all_llms if llm_name in filter_llms]
            if not llms:
                print(f"Error: None of the specified LLMs found in database")
                print(f"Requested: {filter_llms}")
                print(f"Available: {[name for _, name in all_llms]}")
                return []
        else:
            llms = all_llms
        
        if filter_sparsities:
            sparsities = [s for s in all_sparsities if s in filter_sparsities]
            if not sparsities:
                print(f"Error: None of the specified target sparsities found in database")
                print(f"Requested: {filter_sparsities}")
                print(f"Available: {all_sparsities}")
                return []
        else:
            sparsities = all_sparsities
        
        if not llms:
            print("Error: No LLMs found in database")
            return []
        
        if not sparsities:
            print("Error: No target sparsity values found in database")
            return []
        
        print(f"\nFound {len(llms)} LLMs:")
        for llm_id, llm_name in llms:
            print(f"  - {llm_name}")
        
        print(f"\nFound {len(sparsities)} target sparsity values:")
        for sparsity in sparsities:
            print(f"  - {sparsity}%")
        
        total_tables = len(llms) * len(sparsities)
        print(f"\nTotal individual tables: {total_tables}")
        print(f"Using {max_workers} parallel workers")
        print("\nComputing individual rankings...")
        
        # Collect ranks and metric values for each baseline across all tables
        baseline_ranks = defaultdict(list)
        # Track metric values per sparsity level: baseline_name -> {sparsity -> [values]}
        baseline_values_by_sparsity = defaultdict(lambda: defaultdict(list))
        
        # Thread-safe counters and locks
        table_count = 0
        processed = 0
        bar_width = 50
        progress_lock = threading.Lock()
        
        # Create list of all tasks
        tasks = [(llm_id, llm_name, sparsity) for llm_id, llm_name in llms for sparsity in sparsities]
        
        def process_table(llm_id: str, llm_name: str, sparsity: float) -> Tuple[str, str, float, Optional[Dict[str, Dict[str, Any]]]]:
            """Process a single table and return results."""
            rankings = self.get_baseline_ranking_for_llm_sparsity(llm_id, llm_name, sparsity, metric_name)
            return llm_id, llm_name, sparsity, rankings
        
        # Process tables in parallel
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks
            future_to_task = {
                executor.submit(process_table, llm_id, llm_name, sparsity): (llm_name, sparsity)
                for llm_id, llm_name, sparsity in tasks
            }
            
            # Process completed tasks
            for future in as_completed(future_to_task):
                llm_name, sparsity = future_to_task[future]
                
                try:
                    llm_id, llm_name, sparsity, rankings = future.result()
                    
                    # Thread-safe progress update
                    with progress_lock:
                        processed += 1
                        
                        # Progress bar
                        progress = processed / total_tables
                        filled = int(bar_width * progress)
                        bar = '█' * filled + '░' * (bar_width - filled)
                        percent = progress * 100
                        
                        print(f"\r  [{bar}] {percent:5.1f}% ({processed}/{total_tables}) - Completed: {llm_name[:40]:<40} @ {sparsity:5.1f}%", end='', flush=True)
                        
                        # Collect results
                        if rankings:
                            table_count += 1
                            for baseline_name, data in rankings.items():
                                baseline_ranks[baseline_name].append(data['rank'])
                                if data.get('metric_value') is not None:
                                    # Store metric value organized by sparsity level
                                    baseline_values_by_sparsity[baseline_name][sparsity].append(data['metric_value'])
                
                except Exception as e:
                    with progress_lock:
                        processed += 1
                        print(f"\n  Error processing {llm_name} @ {sparsity}%: {e}")
        
        # Clear the progress bar line and print completion
        print(f"\r  [{'█' * bar_width}] 100.0% ({total_tables}/{total_tables}) - Completed!{' ' * 50}")
        
        print(f"\nSuccessfully processed {table_count} individual tables")
        print(f"Found {len(baseline_ranks)} baselines with at least one ranking")
        
        # Compute average ranks and average metric values per sparsity
        results = []
        for baseline_name, ranks in baseline_ranks.items():
            avg_rank = sum(ranks) / len(ranks)
            
            # Compute average metric value for each sparsity level
            values_by_sparsity = baseline_values_by_sparsity.get(baseline_name, {})
            avg_values_per_sparsity = {}
            for sparsity, values in values_by_sparsity.items():
                avg_values_per_sparsity[sparsity] = sum(values) / len(values) if values else None
            
            results.append({
                'baseline_name': baseline_name,
                'avg_rank': avg_rank,
                'avg_values_per_sparsity': avg_values_per_sparsity,
                'num_tables': len(ranks),
                'rank': None,  # Will be assigned after sorting
                'metric_name': metric_name  # Store metric name for display
            })
        
        # Sort by average rank (ascending - lower is better)
        results.sort(key=lambda x: x['avg_rank'])
        
        # Assign final ranks
        for i, result in enumerate(results, 1):
            result['rank'] = i
        
        return results

    def print_table(
        self,
        results: List[Dict[str, Any]],
        sparsities: List[float],
        metric_name: str,
        filter_llms: Optional[List[str]] = None,
        filter_sparsities: Optional[List[float]] = None
    ):
        """Print results as a formatted table."""
        if not results:
            print("No results to display")
            return
        
        # Sort sparsities for consistent column order
        sorted_sparsities = sorted(sparsities)
        
        # Determine column label based on metric
        if metric_name == 'overall_score':
            col_prefix = 'Gap@'
            col_suffix = '%'
        elif metric_name == 'average_local_error':
            col_prefix = 'Err@'
            col_suffix = '%'
        else:
            col_prefix = 'Val@'
            col_suffix = '%'
        
        # Calculate dynamic column widths
        base_width = 6 + 40 + 15 + 12  # Rank + Baseline + Avg Rank + # Tables
        metric_col_width = 14
        total_width = base_width + (metric_col_width * len(sorted_sparsities))
        
        print("\n" + "=" * total_width)
        print(f"Combined Baseline Rankings - Metric: {metric_name}")
        if filter_llms or filter_sparsities:
            print("Filtered View:")
            if filter_llms:
                print(f"  LLMs: {', '.join(filter_llms)}")
            else:
                print(f"  LLMs: All")
            if filter_sparsities:
                print(f"  Sparsities: {', '.join([f'{s}%' for s in filter_sparsities])}")
            else:
                print(f"  Sparsities: All")
        else:
            print("Aggregated across all LLMs and target sparsities")
        print("=" * total_width)
        
        # Header - dynamic columns for each sparsity
        header = f"{'Rank':<6} {'Baseline':<40} {'Average Rank':<15}"
        for sparsity in sorted_sparsities:
            header += f" {col_prefix + f'{sparsity:.1f}' + col_suffix:<{metric_col_width}}"
        header += f" {'# Tables':<12}"
        print(header)
        print("-" * total_width)
        
        # Rows
        for result in results:
            rank = result['rank']
            baseline = result['baseline_name']
            # Add indicator for dense baseline
            if baseline.lower() == 'dense':
                baseline = f"{baseline} (Full Attention)"
            avg_rank = f"{result['avg_rank']:.2f}"
            
            row = f"{rank:<6} {baseline:<40} {avg_rank:<15}"
            
            # Add metric value columns for each sparsity
            avg_values = result.get('avg_values_per_sparsity', {})
            for sparsity in sorted_sparsities:
                value = avg_values.get(sparsity)
                if value is not None:
                    if metric_name == 'overall_score':
                        # For overall_score gap, show sign
                        if value >= 0:
                            value_str = f"+{value:.2f}%"
                        else:
                            value_str = f"{value:.2f}%"
                    else:
                        # For error metrics, just show value
                        value_str = f"{value:.2f}%"
                else:
                    value_str = 'N/A'
                row += f" {value_str:<{metric_col_width}}"
            
            num_tables = result['num_tables']
            row += f" {num_tables:<12}"
            
            print(row)
        
        print("=" * total_width)
        print(f"\nTotal baselines: {len(results)}")
        print("Note: Lower average rank is better. Rank 1 = best overall performance.")
        if metric_name == 'overall_score':
            print("      Gap@X% shows average performance gap at sparsity X% relative to dense baseline.")
        elif metric_name == 'average_local_error':
            print("      Err@X% shows average local error (×100) at sparsity X%.")

    def export_json(self, results: List[Dict[str, Any]]) -> str:
        """Export results as JSON string."""
        return json.dumps(results, indent=2, default=str)

    def export_csv(self, results: List[Dict[str, Any]], sparsities: List[float], metric_name: str) -> str:
        """Export results as CSV string."""
        if not results:
            return ""
        
        # Sort sparsities for consistent column order
        sorted_sparsities = sorted(sparsities)
        
        # Determine column prefix based on metric
        if metric_name == 'overall_score':
            col_prefix = 'gap_at'
        elif metric_name == 'average_local_error':
            col_prefix = 'error_at'
        else:
            col_prefix = 'value_at'
        
        # CSV header - dynamic columns for each sparsity
        header = ["rank", "baseline_name", "avg_rank"]
        for sparsity in sorted_sparsities:
            header.append(f"{col_prefix}_{sparsity:.1f}pct")
        header.append("num_tables")
        lines = [",".join(header)]
        
        # CSV rows
        for result in results:
            row = [
                str(result['rank']),
                f"\"{result['baseline_name']}\"",
                f"{result['avg_rank']:.2f}"
            ]
            
            # Add metric values for each sparsity
            avg_values = result.get('avg_values_per_sparsity', {})
            for sparsity in sorted_sparsities:
                value = avg_values.get(sparsity)
                if value is not None:
                    row.append(f"{value:.2f}")
                else:
                    row.append("")
            
            row.append(str(result['num_tables']))
            lines.append(",".join(row))
        
        return "\n".join(lines)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Generate combined baseline ranking across all LLMs and target sparsities'
    )
    parser.add_argument(
        '--output',
        type=str,
        choices=['table', 'json', 'csv'],
        default='table',
        help='Output format (default: table)'
    )
    parser.add_argument(
        '--file',
        type=str,
        help='Output file path (default: stdout)'
    )
    parser.add_argument(
        '--llms',
        type=str,
        nargs='+',
        help='Filter by specific LLM names (space-separated). If not set, uses all LLMs.'
    )
    parser.add_argument(
        '--sparsities',
        type=float,
        nargs='+',
        help='Filter by specific target sparsity values (space-separated). If not set, uses all sparsities.'
    )
    parser.add_argument(
        '--workers',
        type=int,
        default=4,
        help='Number of parallel workers for table computation (default: 4)'
    )
    parser.add_argument(
        '--metric',
        type=str,
        default='overall_score',
        choices=['overall_score', 'average_local_error'],
        help='Metric to rank baselines by (default: overall_score)'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed progress information'
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
    
    # Create generator and run
    try:
        generator = CombinedViewGenerator(supabase_url, supabase_key)
        
        results = generator.compute_combined_ranking(
            filter_llms=args.llms,
            filter_sparsities=args.sparsities,
            max_workers=args.workers,
            metric_name=args.metric
        )
        
        if not results:
            print("No results found")
            sys.exit(1)
        
        # Get all sparsities for table headers (discover from database if not filtered)
        if args.sparsities:
            display_sparsities = args.sparsities
        else:
            display_sparsities = generator.get_all_target_sparsities()
        
        # Generate output based on format
        if args.output == 'table':
            output = None
            generator.print_table(
                results,
                sparsities=display_sparsities,
                metric_name=args.metric,
                filter_llms=args.llms,
                filter_sparsities=args.sparsities
            )
        elif args.output == 'json':
            output = generator.export_json(results)
        elif args.output == 'csv':
            output = generator.export_csv(results, display_sparsities, args.metric)
        
        # Write to file if specified
        if args.file and output:
            with open(args.file, 'w') as f:
                f.write(output)
            print(f"\nOutput written to: {args.file}")
        elif output:
            print(output)
            
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

