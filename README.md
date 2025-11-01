<p align="center">
  <img src="apps/frontend/public/sky-light-logo.png" alt="Sky Light Logo" width="200" />
</p>

<p align="center" style="font-size: 1.15rem; margin-bottom: 0.5em;">
  <em>Sparse Attention Leaderboard</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Express-4.18+-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TailwindCSS-3.0+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query"/>
  <img src="https://img.shields.io/badge/React_Router-6-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router"/>
</p>

<br/>

<p align="center" style="font-size: 1rem; max-width: 640px; margin: 0 auto;">
  A comprehensive leaderboard for comparing Sparse Attention baselines across multiple benchmarks and datasets.
</p>

<br>

## Quick Start

### Prerequisites

Before starting, you **must** configure your Supabase PostgreSQL database:

1. **Create a Supabase Project**
   - Sign up at [https://supabase.com](https://supabase.com)
   - Create a new project
   - Apply the database schema from `DB_Schema.md` via the Supabase SQL editor

2. **Set up Supabase credentials**

   Create a `.env` file in `apps/backend/`:
   ```bash
   cd apps/backend
   cat > .env << EOF
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_KEY=your_supabase_anon_key_here
   PORT=3000
   EOF
   ```

   Or set environment variables:
   ```bash
   export SUPABASE_URL=your_supabase_url_here
   export SUPABASE_KEY=your_supabase_anon_key_here
   ```

   **⚠️ REQUIRED:** The backend requires valid Supabase credentials to start. It will not run without them.

### Automated Setup (Recommended)

**Option 1: Node.js script (cross-platform)**
```bash
npm start
```

**Option 2: Shell script (Unix/macOS)**
```bash
./start.sh
```

**Option 3: Batch script (Windows)**
```cmd
start.bat
```

All scripts will:
- ✓ Check for Node.js 18+ and npm
- ✓ Install dependencies if needed
- ✓ Verify ports 3000 and 5173 are available
- ✓ Start both backend and frontend servers

### Manual Setup

```bash
# Install dependencies
npm install

# Run both servers in development mode
npm run dev

# Or run individually
npm run dev:backend  # Backend only on port 3000
npm run dev:frontend # Frontend only on port 5173
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1
- Health Check: http://localhost:3000/health

## Project Structure

```
sky-light/
├── apps/
│   ├── backend/              # Express.js API server
│   │   ├── src/
│   │   │   ├── controllers/  # Request handlers (thin layer)
│   │   │   ├── services/     # Business logic
│   │   │   ├── repositories/ # Data access layer
│   │   │   ├── models/       # Data models
│   │   │   ├── routes/       # API route definitions
│   │   │   └── app.ts        # Express app setup
│   │   └── package.json
│   │
│   └── frontend/             # React frontend
│       ├── src/
│       │   ├── components/   # Reusable UI components
│       │   ├── pages/        # Route pages
│       │   ├── hooks/        # Custom React hooks
│       │   ├── services/     # API client
│       │   └── App.tsx       # Main app component
│       └── package.json
│
├── packages/
│   └── shared-types/         # Shared TypeScript types
│       └── src/index.ts
│
├── start.sh                  # Unix startup script
├── start.bat                 # Windows startup script
└── package.json              # Root package.json (workspace)
```


## Development

### Requirements
- Node.js 18 or higher
- npm 8 or higher
- **Supabase account with configured project** (required - see Prerequisites)

### Database

**Implementation:** Supabase PostgreSQL (required)

The backend uses Supabase PostgreSQL exclusively for all data storage and retrieval. Valid Supabase credentials are **required** for the backend to function.

### Adding New Baselines

Use the data upload script to add baselines to your Supabase database:

```bash
cd database_mgmt
python upload.py --file your_data.jsonl
```

See `database_mgmt/example_data.jsonl` for data format examples.

### Adding New Datasets

1. Prepare data in JSONL format (see `database_mgmt/example_data.jsonl`)
2. Upload using the upload script:
   ```bash
   cd database_mgmt
   python upload.py --file your_data.jsonl
   ```

For detailed database schema and upload instructions, see `database_mgmt/README.md`

### API Endpoints

```
GET /api/v1/baselines              # List all baselines
GET /api/v1/benchmarks             # List all benchmarks
GET /api/v1/datasets               # List all datasets
GET /api/v1/leaderboards/dataset/:id  # Dataset-specific ranking
GET /api/v1/leaderboards/aggregated   # Cross-dataset aggregated ranking
GET /api/v1/leaderboards/overview     # Summary statistics
```

Query parameters:
- `llm` - Filter by LLM
- `baseline` - Filter by baseline
- `sortBy` - Sort by metric
- `order` - `asc` or `desc`
