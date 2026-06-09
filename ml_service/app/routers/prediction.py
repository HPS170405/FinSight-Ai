from fastapi import APIRouter

router = APIRouter()

@router.get("/risk/{ticker}")
async def predict_risk(ticker: str):
    return {"ticker": ticker, "risk_score": 0.5, "status": "Not implemented"}
