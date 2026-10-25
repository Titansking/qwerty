# GridBrick — UK Wind Generation Forecast Accuracy Portal

A web application that helps UK energy utilities evaluate day-ahead wind generation
forecasts against actual generation, enabling informed electricity purchase decisions
from the wholesale day-ahead market.

## Problem

UK energy utilities must buy electricity from the wholesale day-ahead market one day
before delivery. To size their thermal plant purchases, they need to know how much
wind generation to expect. Wind generation is weather-dependent, so they rely on
renewable forecasts — and need to understand both the latest forecast and its
quantified error.

This portal addresses two needs:

1. **Understand the latest renewable generation forecasts** available when making
   day-ahead purchase decisions.
2. **Evaluate forecast accuracy quantitatively** (MAE, RMSE, MAPE, bias, correlation)
   so decisions can be made with quantified error in mind.

Data is sourced exclusively from **Elexon BMRS** (FUELHH actuals, WINDFOR forecasts),
national-level wind generation, scoped to January 2026.

## Folder Structure

```
gridbrick/
├── backend/                    # Python FastAPI backend
│   ├── .env.example            # Backend environment variables
│   ├── Dockerfile              # Backend container image
│   ├── requirements.txt        # Python dependencies
│   └── app/
│       ├── __init__.py
│       ├── main.py             # FastAPI app entry point + middleware
│       ├── core/
│       │   ├── __init__.py
│       │   └── config.py       # Pydantic settings (env-config separation)
│       ├── api/
│       │   ├── __init__.py     # API router registration
│       │   └── routes/
│       │       ├── __init__.py
│       │       ├── health.py        # Health check
│       │       ├── actuals.py       # GET /api/actuals
│       │       ├── forecasts.py     # GET /api/forecasts
│       │       ├── forecast_actuals.py  # GET /api/forecast-actuals
│       │       └── accuracy.py      # GET /api/accuracy
│       ├── models/
│       │   ├── __init__.py
│       │   └── schemas.py       # Pydantic request/response schemas
│       ├── services/
│       │   ├── __init__.py
│       │   ├── elexon_client.py   # Elexon BMRS HTTP client
│       │   ├── data_service.py    # Business logic: fetch + match actuals/forecasts
│       │   └── accuracy_service.py # Accuracy metrics computation
│       └── utils/
│           ├── __init__.py
│           └── cache.py         # TTL in-memory cache
├── frontend/                   # React TypeScript frontend
│   ├── .env.example            # Frontend environment variables
│   ├── Dockerfile              # Frontend container image
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── src/
│       ├── main.tsx            # React entry point
│       ├── App.tsx             # Router + navigation shell
│       ├── index.css           # Tailwind + base styles
│       ├── types/index.ts      # Shared TypeScript types
│       ├── api/client.ts       # Centralised API fetch client
│       ├── store/store.ts      # Zustand state management
│       ├── lib/utils.ts        # Pure formatting helpers
│       ├── components/
│       │   ├── common/         # Reusable UI (Card, MetricCard, Loading, ErrorAlert)
│       │   ├── dashboard/      # ForecastChart, LatestForecastTable, SummaryCards
│       │   └── accuracy/       # AccuracyMetrics, AccuracyChart, ErrorDistribution
│       └── pages/
│           ├── Dashboard.tsx   # Client-facing overview
│           ├── Accuracy.tsx    # Quantitative accuracy view
│           ├── Forecasts.tsx   # Forecast-actual pairs table
│           └── NotFound.tsx    # 404 page
├── docker-compose.yml          # Multi-container orchestration
├── .env.example                # Root environment variables
├── .gitignore
└── README.md
```

## Design Principles

- **Separation of concerns**: Business logic (services) is decoupled from transport
  (Elexon client) and presentation (API routes / React components).
- **Environment configuration**: All configuration lives in `.env` files; code never
  contains hardcoded secrets or endpoints.
- **Reusable components**: Common UI primitives (`Card`, `MetricCard`, `Loading`,
  `ErrorAlert`) are shared across pages.
- **State management**: Zustand store centralises server state, loading flags, and
  errors — no prop drilling.
- **Error handling**: Every API call is wrapped in try/catch; the backend returns
  structured error responses; the frontend displays user-friendly error banners.
- **Scalable API structure**: Route handlers are split by resource under
  `app/api/routes/` and registered through a single router in `app/api/__init__.py`.
- **Consistent naming**: `snake_case` for Python, `PascalCase` for React components,
  `camelCase` for JavaScript variables/functions, `kebab-case` for files.

## How to Start the Application

### Option 1: Docker Compose (recommended)

```bash
# Clone the repository
cd gridbrick

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up --build

# The app will be available at:
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API docs: http://localhost:8000/docs
```

### Option 2: Run locally without Docker

**Backend:**

```bash
cd backend
cp .env.example .env
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Option 3: Backend only

```bash
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/actuals` | GET | Half-hourly actual wind generation (FUELHH) |
| `/api/forecasts` | GET | Wind generation forecasts (WINDFOR) |
| `/api/forecast-actuals` | GET | Matched forecast-actual pairs |
| `/api/accuracy` | GET | Accuracy metrics (MAE, RMSE, MAPE, bias, correlation) |
| `/docs` | GET | Interactive API documentation (Swagger UI) |

Query parameters: `start_date` (YYYY-MM-DD), `end_date` (YYYY-MM-DD),
`force_refresh` (boolean, actuals/forecasts only).

## Accuracy Metrics Explained

- **MAE (Mean Absolute Error)**: Average magnitude of forecast errors in MW.
- **RMSE (Root Mean Squared Error)**: Like MAE but penalises large errors more.
- **MAPE (Mean Absolute Percentage Error)**: Error as a percentage of actual.
- **Bias**: Mean(forecast − actual). Positive = systematic over-forecasting.
- **Correlation**: Linear relationship between forecast and actual (−1 to 1).

## Deployment

### Backend (Heroku)

```bash
cd backend
heroku create gridbrick-backend
heroku config:set CORS_ORIGINS="https://your-frontend.vercel.app"
git push heroku main
heroku ps:scale web=1
```

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
# Set environment variable: VITE_API_BASE_URL=https://your-backend.herokuapp.com
```

### Docker (any platform)

```bash
docker-compose up --build
```

## AI Tools Disclosure

AI tools were used to assist with code generation, debugging, and documentation
during the development of this application.

## Data Source

- **Elexon BMRS API**: https://data.elexon.co.uk/bmrs/api/v1/
- **FUELHH dataset**: Actual half-hourly generation by fuel type (WIND)
- **WINDFOR dataset**: Wind power forecasts
- **Scope**: UK national level, January 2026

## License

Internal pilot project — for evaluation purposes only.