from fastapi import APIRouter
from pydantic import BaseModel
from app.models.anomaly_model import detector
from app.services.stock_fetcher import get_daily_prices

router = APIRouter()

class AnomalyRequest(BaseModel):
    ticker: str
    days: int = 60

@router.post("/detect")
async def detect_anomaly(req: AnomalyRequest):
    prices = get_daily_prices(req.ticker, req.days)
    result = detector.detect(prices)
    return {"ticker": req.ticker, **result}
