from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent.parent / '.env')
from app.routers import anomaly, prediction, agents, stocks

app = FastAPI(title="FinSight ML Service", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(anomaly.router, prefix="/anomaly")
app.include_router(prediction.router, prefix="/predict")
app.include_router(agents.router, prefix="/agents")
app.include_router(stocks.router, prefix="/stocks")

@app.get("/health")
async def health():
    return {"status": "ok"}
