# Database Management

This directory contains scripts and tools for managing the Sky Light leaderboard database in Supabase.

## Files

- **`DB_Schema.md`**: Complete PostgreSQL schema definition (located in parent directory)
- **`example_data.jsonl`**: Sample experimental results in JSONL format
- **`upload.py`**: Script to upload JSONL data to Supabase
- **`requirements.txt`**: Python dependencies

## Setup

### 1. Install Python Dependencies

```bash
cd database_mgmt
pip install -r requirements.txt
```

### 2. Configure Supabase Credentials

You need two pieces of information from your Supabase project:

1. **Project URL**: Found in your Supabase dashboard under Settings → API → Project URL
   - Format: `https://your-project-id.supabase.co`

2. **Anon/Public Key**: Found in Project -> Sky Light -> Connect -> App Framworks
   - This is a long JWT token

Set them as environment variables:

```bash
export SUPABASE_URL="https://your-project-id.supabase.co"
export SUPABASE_KEY="your-anon-key-here"
```

Alternatively, create a `.env` file in this directory:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
```

### 3. Create Database Schema

Before running the upload script, ensure your Supabase database has the correct schema:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the contents of `../DB_Schema.md` 
4. Execute the SQL to create all tables

## Usage

### Upload Data to Supabase

```bash
python upload.py
```

The script will:
1. Parse `example_data.jsonl`
2. Create an experimental run
3. Upsert all entities (benchmarks, datasets, baselines, LLMs, metrics)
4. Create configurations for each baseline+dataset+llm combination
5. Insert metric results

### What the Script Does

The upload process follows this sequence:

```
JSONL Record
    ↓
1. Extract & Upsert Benchmark (ruler32k)
    ↓
2. Extract & Upsert Dataset (qa_1, fwe, vt, etc.)
    ↓
3. Extract & Upsert Baseline (dense, oracle-topk, vAttention)
    ↓
4. Extract & Upsert LLM (Llama-3.1-8B, Qwen3-30B, etc.)
    ↓
5. Extract & Upsert Metrics (string_match, accuracy, etc.)
    ↓
6. Create Dataset-Metric relationships
    ↓
7. Create Configuration (baseline+dataset+llm+params)
    ↓
8. Insert Results (metric values)
```

### Data Mapping

| JSONL Field | Database Table/Field |
|-------------|---------------------|
| `benchmark` | `benchmarks.name` |
| `dataset` | `datasets.name` |
| `baseline` | `baselines.name` |
| `model_name` | `llms.name` |
| `benchmark_metrics` keys | `metrics.name` |
| `average_density` | `configurations.target_sparsity` (converted to %) |
| `aux_memory` | `configurations.target_aux_memory` |
| `config` | `configurations.additional_params` (JSONB) |
| `benchmark_metrics` values | `results.value` |

### Sparsity Conversion

The script converts `average_density` from decimal to percentage:
- Input: `0.022876878130285605` (2.29%)
- Stored: `2.29` in `target_sparsity` field

For "dense" baseline, `target_sparsity` is `NULL`.

### Handling Duplicates

The script uses **upsert** logic:
- If a record exists (matched by unique constraints), it returns the existing ID
- If a record doesn't exist, it creates a new one
- This allows running the script multiple times safely

### Error Handling

- Invalid JSON lines are skipped with a warning
- Missing required fields stop processing for that record
- Database errors are logged but allow continuing with next records
- Full stack traces are shown for debugging

## Verifying Upload

After running the script, verify the upload in Supabase:

```sql
-- Check counts
SELECT 'benchmarks' AS table_name, COUNT(*) FROM benchmarks
UNION ALL
SELECT 'datasets', COUNT(*) FROM datasets
UNION ALL
SELECT 'baselines', COUNT(*) FROM baselines
UNION ALL
SELECT 'llms', COUNT(*) FROM llms
UNION ALL
SELECT 'metrics', COUNT(*) FROM metrics
UNION ALL
SELECT 'configurations', COUNT(*) FROM configurations
UNION ALL
SELECT 'results', COUNT(*) FROM results;

-- View sample results with joined data
SELECT 
    b.name AS baseline,
    d.name AS dataset,
    l.name AS llm,
    m.name AS metric,
    r.value,
    c.target_sparsity
FROM results r
JOIN configurations c ON r.configuration_id = c.id
JOIN baselines b ON c.baseline_id = b.id
JOIN datasets d ON c.dataset_id = d.id
JOIN llms l ON c.llm_id = l.id
JOIN metrics m ON r.metric_id = m.id
LIMIT 20;
```

## Troubleshooting

### "supabase-py not installed"
```bash
pip install supabase
```

### "Missing environment variables"
Ensure `SUPABASE_URL` and `SUPABASE_KEY` are set:
```bash
echo $SUPABASE_URL
echo $SUPABASE_KEY
```

### "Table does not exist"
Run the SQL schema from `DB_Schema.md` in Supabase SQL Editor first.

### "JSONB not supported"
Ensure you're using PostgreSQL (Supabase is PostgreSQL-based). The `additional_params` field requires JSONB support.

### Duplicate key violations
Check the unique constraints in `DB_Schema.md`. The script should handle this via upsert, but if you see errors:
1. Delete existing data: `TRUNCATE TABLE results, configurations, experimental_runs CASCADE;`
2. Re-run the script

## Security Notes

- **Never commit** `.env` files or expose your `SUPABASE_KEY`
- The `anon` key is safe for client-side use but has Row Level Security (RLS) policies
- For write operations in production, consider using a `service_role` key (keep it secret!)
- Enable RLS policies in Supabase for production use

## License

This script is part of the Sky Light project. See main repository for license information.

