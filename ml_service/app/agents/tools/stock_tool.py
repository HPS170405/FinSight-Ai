from crewai.tools import tool
from app.services.stock_fetcher import get_daily_prices, get_current_price

@tool("Stock Data Fetcher")
def stock_data_tool(ticker: str) -> str:
    "Fetches current price and historical OHLCV data for a stock ticker. Input: ticker symbol like 'AAPL' or 'RELIANCE.BSE'"
    price = get_current_price(ticker)
    history = get_daily_prices(ticker, 30)
    recent = history[:5]
    return (
        f"Ticker: {ticker}\n"
        f"Current Price: {price['price']}\n"
        f"Change: {price['change_pct']}%\n"
        f"Recent 5 days: {recent}"
    )
