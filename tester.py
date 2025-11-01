#!/usr/bin/env python3
"""
Diagnostic script to test Supabase API connection and query each table.
This helps identify where the 500 errors are coming from.
"""

import os
import sys

try:
    from supabase import create_client, Client
except ImportError:
    print("Error: supabase-py not installed. Run: pip install supabase")
    sys.exit(1)


def test_supabase_connection():
    """Test basic Supabase connection and query all tables"""
    
    # Get credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set")
        sys.exit(1)
    
    print(f"🔗 Connecting to: {supabase_url}\n")
    
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Supabase client created successfully\n")
    except Exception as e:
        print(f"❌ Failed to create Supabase client: {e}")
        sys.exit(1)
    
    # Test each table
    tables = [
        'benchmarks',
        'datasets', 
        'baselines',
        'llms',
        'metrics',
        'dataset_metrics',
        'configurations',
        'experimental_runs',
        'results'
    ]
    
    for table in tables:
        test_table(supabase, table)
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print("✅ All basic queries completed")
    print("\nNow testing complex queries that the backend uses...")
    
    # Test complex queries
    test_configurations_with_filters(supabase)
    test_results_by_dataset(supabase)


def test_table(supabase: Client, table_name: str):
    """Test querying a specific table"""
    print(f"Testing table: {table_name}")
    print("-" * 40)
    
    try:
        # Simple select all
        response = supabase.table(table_name).select('*').limit(5).execute()
        
        if response.data:
            count = len(response.data)
            print(f"✅ Query successful: {count} row(s) returned")
            
            # Show first row structure
            if count > 0:
                first_row = response.data[0]
                print(f"   Columns: {', '.join(first_row.keys())}")
                print(f"   Sample ID: {first_row.get('id', 'N/A')}")
        else:
            print(f"⚠️  Query returned no data (empty table)")
    
    except Exception as e:
        print(f"❌ Error querying {table_name}: {e}")
        print(f"   Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
    
    print()


def test_configurations_with_filters(supabase: Client):
    """Test configurations query with filters (mimics backend logic)"""
    print("\n" + "="*60)
    print("Testing Complex Query: Configurations with filters")
    print("="*60)
    
    try:
        # Get a dataset ID first
        datasets_response = supabase.table('datasets').select('id').limit(1).execute()
        if not datasets_response.data:
            print("⚠️  No datasets found, skipping test")
            return
        
        dataset_id = datasets_response.data[0]['id']
        print(f"Using dataset_id: {dataset_id}")
        
        # Query configurations for this dataset
        response = supabase.table('configurations').select('*').eq('dataset_id', dataset_id).execute()
        
        print(f"✅ Found {len(response.data)} configuration(s) for dataset")
        
        if response.data:
            config = response.data[0]
            print(f"   Sample config fields:")
            print(f"   - baseline_id: {config.get('baseline_id')}")
            print(f"   - dataset_id: {config.get('dataset_id')}")
            print(f"   - llm_id: {config.get('llm_id')}")
            print(f"   - target_sparsity: {config.get('target_sparsity')}")
            print(f"   - target_aux_memory: {config.get('target_aux_memory')}")
    
    except Exception as e:
        print(f"❌ Error with configurations query: {e}")
        import traceback
        traceback.print_exc()


def test_results_by_dataset(supabase: Client):
    """Test results query by dataset (mimics backend logic)"""
    print("\n" + "="*60)
    print("Testing Complex Query: Results by dataset (with JOIN)")
    print("="*60)
    
    try:
        # Get a dataset ID first
        datasets_response = supabase.table('datasets').select('id').limit(1).execute()
        if not datasets_response.data:
            print("⚠️  No datasets found, skipping test")
            return
        
        dataset_id = datasets_response.data[0]['id']
        print(f"Using dataset_id: {dataset_id}")
        
        # This mimics the query in PostgresResultRepository.findByDatasetId
        response = supabase.table('results').select('''
            *,
            configurations!inner(dataset_id)
        ''').eq('configurations.dataset_id', dataset_id).limit(5).execute()
        
        print(f"✅ Found {len(response.data)} result(s) for dataset")
        
        if response.data:
            result = response.data[0]
            print(f"   Sample result fields:")
            print(f"   - configuration_id: {result.get('configuration_id')}")
            print(f"   - metric_id: {result.get('metric_id')}")
            print(f"   - value: {result.get('value')}")
    
    except Exception as e:
        print(f"❌ Error with results query: {e}")
        print(f"   Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()


def main():
    print("="*60)
    print("Supabase Connection Diagnostic Tool")
    print("="*60)
    print()
    
    test_supabase_connection()
    
    print("\n" + "="*60)
    print("✅ Diagnostics complete!")
    print("="*60)


if __name__ == '__main__':
    main()

