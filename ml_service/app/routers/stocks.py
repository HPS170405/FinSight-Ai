from fastapi import APIRouter
from app.services.stock_fetcher import get_current_price, get_daily_prices

router = APIRouter()

@router.get("/price/{ticker}")
async def current_price(ticker: str):
    return get_current_price(ticker)

@router.get("/history/{ticker}")
async def price_history(ticker: str, days: int = 30):
    return {"ticker": ticker, "prices": get_daily_prices(ticker, days)}
