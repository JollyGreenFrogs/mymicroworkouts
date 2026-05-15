# Development Setup Guide

This guide walks you through setting up My Micro Workouts for local development.

## Quick Start

```bash
# 1. Clone
git clone <repository-url>
cd mymicroworkouts

# 2. Set up environment variables
cp auth-sidecar/.env.example auth-sidecar/.env
# Edit auth-sidecar/.env — fill in JWT_SECRET_KEY and DATA_ENCRYPTION_KEY

# 3. Start full stack
./dev.sh
```

App will be at: `http://localhost:8788`

## Stack

| Component | Technology |
|-----------|-----------|
| Frontend  | Static HTML/JS/CSS served by nginx 1.27 |
| API / Auth | FastAPI (`auth-sidecar/`) on port 8787 (internal) |
| Database  | PostgreSQL 16 (`admin` schema) |
| Container | Docker Compose |

## Prerequisites

- Docker + Docker Compose
- Python 3.12 (for running tests locally without Docker)
- Node.js 18+ (for running Playwright e2e tests)

## Environment Variables

Copy and edit:

```bash
cp auth-sidecar/.env.example auth-sidecar/.env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | HS256 signing secret — generate with `python -c "import secrets; print(secrets.token_urlsafe(32))"` |
| `DATA_ENCRYPTION_KEY` | Fernet key for PII — generate with `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (`http://localhost:8788` for dev) |
| `ENVIRONMENT` | `development` / `uat` / `production` |
| `FRONTEND_URL` | Used in auth redirect flows |

## Starting the Dev Server

```bash
./dev.sh
```

This sources `auth-sidecar/.env`, exports vars for Docker Compose substitution, then runs:

```bash
docker compose up --build
```

The sidecar's `CMD` automatically runs `jgf-auth-db upgrade head` (Alembic migrations) before starting.

## File Structure

```
mymicroworkouts/
├── auth-sidecar/            # FastAPI auth + workouts API
│   ├── Dockerfile
│   ├── main.py              # App entry point, mounts routers
│   ├── requirements.txt
│   └── jgf-auth/            # jgf_auth package (auth, sessions, workouts)
│       └── jgf_auth/
│           ├── alembic/     # DB migrations
│           ├── database_models/
│           ├── routes/      # auth_route.py, workouts_route.py
│           ├── services/
│           └── utils/
├── nginx/
│   ├── Dockerfile           # Bakes public/ into the image
│   └── nginx.conf           # Security headers + /api/ proxy
├── public/                  # Static frontend (HTML/JS/CSS)
├── e2e/                     # Playwright end-to-end tests
├── scripts/
│   └── start-e2e-server.sh  # Spins up isolated e2e stack
├── docker-compose.yml       # Production base
├── docker-compose.uat.yml   # UAT overlay (frogjump)
├── docker-compose.e2e.yml   # Isolated e2e test stack
└── .woodpecker.yml          # CI/CD pipeline
```

## Running Tests

### Python unit tests

```bash
cd auth-sidecar/jgf-auth
pip install -e ".[dev]"
pytest tests/
```

### End-to-end tests (Playwright)

```bash
npm ci
bash scripts/start-e2e-server.sh   # starts e2e stack on port 8789
npx playwright test
```

## Database Access (local)

Connect to the dev postgres container:

```bash
docker compose exec postgres psql -U mwauth -d mwauth
```

Useful queries:

```sql
-- List tables
\dt admin.*

-- View users
SELECT code, role, is_email_verified FROM admin.users;

-- View workouts
SELECT user_code, day, time, exercise, completed, week_start FROM admin.workouts;
```

## Development Workflow

1. Edit code in `public/` (frontend) or `auth-sidecar/` (API)
2. `docker compose up --build` picks up changes on restart
3. Add DB columns? Write an Alembic migration:
   ```bash
   cd auth-sidecar/jgf-auth
   alembic revision --autogenerate -m "describe change"
   alembic upgrade head
   ```
4. Commit on a `feat/` or `fix/` branch, open PR to `develop`
5. Merging to `develop` triggers UAT deploy on frogjump (10.0.27.51:8790)
6. Merging to `main` triggers prod deploy on frost (10.0.27.50:8788)

