import requests
import os
import time

ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_KEY")
BASE_URL = "https://www.alphavantage.co/query"

# In-memory price cache: { ticker: (price, change_pct, timestamp) }
_price_cache = {}
CACHE_TTL = 3600  # 1 hour — key only allows 25 calls/day

def get_daily_prices(ticker: str, days: int = 60) -> list[dict]:
    """Fetch last N days of daily OHLCV data for a ticker."""
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": ticker,
        "apikey": ALPHA_VANTAGE_KEY,
        "outputsize": "compact"
    }
    r = requests.get(BASE_URL, params=params)
    data = r.json().get("Time Series (Daily)", {})
    rows = []
    for date, values in list(data.items())[:days]:
        rows.append({
            "date": date,
            "open": float(values["1. open"]),
            "high": float(values["2. high"]),
            "low": float(values["3. low"]),
            "close": float(values["4. close"]),
            "volume": int(values["5. volume"]),
        })
    return rows

def get_current_price(ticker: str, force_refresh: bool = False) -> dict:
    now = time.time()
    cached = _price_cache.get(ticker)
    if cached and not force_refresh and (now - cached[2]) < CACHE_TTL:
        return {"ticker": ticker, "price": cached[0], "change_pct": cached[1]}

    params = {
        "function": "GLOBAL_QUOTE",
        "symbol": ticker,
        "apikey": ALPHA_VANTAGE_KEY
    }
    r = requests.get(BASE_URL, params=params)
    data = r.json()

    # Alpha Vantage rate limit / quota exhausted
    if "Note" in data or "Information" in data:
        if cached:
            return {"ticker": ticker, "price": cached[0], "change_pct": cached[1]}
        return {"ticker": ticker, "price": 0, "change_pct": 0}

    quote = data.get("Global Quote", {})
    price = float(quote.get("05. price", 0))
    change_pct = float(quote.get("10. change percent", "0%").rstrip("%"))

    if price > 0:
        _price_cache[ticker] = (price, change_pct, now)

    return {"ticker": ticker, "price": price, "change_pct": change_pct}
