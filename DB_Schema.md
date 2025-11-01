-- ============================================================================
-- MASTER/REFERENCE TABLES
-- ============================================================================

-- Benchmarks: Top-level grouping for datasets
CREATE TABLE benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    paper_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datasets: Specific test sets within benchmarks (this design would allow the same dataset to exist multiple times)
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    benchmark_id UUID NOT NULL REFERENCES benchmarks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    size INTEGER, -- number of examples
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(benchmark_id, name)
);

-- Metrics: Measurements tracked per dataset
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE, -- e.g., "accuracy", "f1_score"
    display_name VARCHAR(255) NOT NULL, -- e.g., "Accuracy (%)"
    description TEXT,
    unit VARCHAR(50), -- e.g., "%", "ms", "tokens/sec"
    higher_is_better BOOLEAN NOT NULL DEFAULT true, -- for ranking direction
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dataset-Metric relationship (many-to-many)
-- Different datasets can track different metrics
CREATE TABLE dataset_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    metric_id UUID NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
    weight DECIMAL(5,4) DEFAULT 1.0, -- for weighted scoring within dataset
    is_primary BOOLEAN DEFAULT false, -- primary metric for ranking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dataset_id, metric_id)
);

-- Baselines: Sparse attention implementations
CREATE TABLE baselines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    paper_url VARCHAR(500),
    code_url VARCHAR(500),
    version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Large Language Models
CREATE TABLE llms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE, -- e.g., "GPT-5"
    provider VARCHAR(100), -- e.g., "OpenAI", "Meta"
    parameter_count BIGINT, -- number of parameters
    context_length INTEGER, -- max context window
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EXPERIMENTAL CONFIGURATION TABLES
-- ============================================================================

-- Configurations: Unique combinations of Baseline × Dataset × LLM × Parameters
-- Supports multiple configurations for same baseline-dataset-llm with different sparsity/memory settings
CREATE TABLE configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baseline_id UUID NOT NULL REFERENCES baselines(id) ON DELETE CASCADE,
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    llm_id UUID NOT NULL REFERENCES llms(id) ON DELETE CASCADE,
    
    -- Explicit experimental parameters
    target_sparsity DECIMAL(5,2), -- e.g., 1.00 for 1%, 5.00 for 5%, 20.00 for 20%
    target_aux_memory BIGINT, -- target auxiliary memory in bytes or tokens
    
    -- Additional configuration parameters (for extensibility)
    additional_params JSONB, -- flexible storage for other hyperparameters
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint includes parameters to allow multiple configs for same baseline-dataset-llm
    -- COALESCE handles NULL values to ensure uniqueness works correctly
    UNIQUE(baseline_id, dataset_id, llm_id, 
           COALESCE(target_sparsity, -1), 
           COALESCE(target_aux_memory, -1))
);

-- Indexes for common queries
CREATE INDEX idx_configurations_baseline ON configurations(baseline_id);
CREATE INDEX idx_configurations_dataset ON configurations(dataset_id);
CREATE INDEX idx_configurations_llm ON configurations(llm_id);
CREATE INDEX idx_configurations_sparsity ON configurations(target_sparsity);
CREATE INDEX idx_configurations_memory ON configurations(target_aux_memory);

-- ============================================================================
-- RESULTS TABLES (High-volume transactional data)
-- ============================================================================

-- Experimental runs: Metadata about when/how tests were executed
CREATE TABLE experimental_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    description TEXT,
    run_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    metadata JSONB, -- flexible storage for run context
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Results: Raw metric values for each configuration
CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuration_id UUID NOT NULL REFERENCES configurations(id) ON DELETE CASCADE,
    metric_id UUID NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
    experimental_run_id UUID REFERENCES experimental_runs(id) ON DELETE SET NULL,
    
    -- The actual measurement
    value DECIMAL(15,6) NOT NULL,
    
    -- Optional metadata
    standard_deviation DECIMAL(15,6), -- if multiple runs
    sample_size INTEGER, -- number of examples evaluated
    execution_time_ms INTEGER, -- performance tracking
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one result per configuration-metric-run combination
    UNIQUE(configuration_id, metric_id, experimental_run_id)
);

-- Indexes for performance on frequently queried columns (optional)
CREATE INDEX idx_results_configuration ON results(configuration_id);
CREATE INDEX idx_results_metric ON results(metric_id);
CREATE INDEX idx_results_run ON results(experimental_run_id);
CREATE INDEX idx_results_value ON results(value); -- for ranking queries