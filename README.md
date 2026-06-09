# FinSight AI

FinSight AI is a multi-agent, full-stack financial intelligence platform.

## Architecture
- **Frontend**: React + Vite + TailwindCSS
- **Backend API**: Node.js + Express
- **ML Microservice**: Python + FastAPI + CrewAI + pgvector
- **Database**: PostgreSQL
- **Cache**: Redis

## Quick Start
1. Ensure Docker is running.
2. Run `docker-compose up -d`.
3. Set up `.env` files in `server/` and `ml_service/`.
4. Run `npm run dev` in `server/`.
5. Run `uvicorn app.main:app --reload` in `ml_service/`.
6. Run `pnpm dev` in `client/`.
