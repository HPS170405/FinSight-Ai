import requests
import os
from crewai.tools import tool

NEWS_API_KEY = os.getenv("NEWS_API_KEY")

@tool("Financial News Fetcher")
def financial_news_tool(query: str) -> str:
    "Fetches recent news articles about a company or stock ticker. Input: company name or ticker symbol."
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "sortBy": "publishedAt",
        "pageSize": 5,
        "language": "en",
        "apiKey": NEWS_API_KEY
    }
    r = requests.get(url, params=params)
    articles = r.json().get("articles", [])
    summaries = []
    for a in articles:
        summaries.append(f"- {a['title']} ({a['publishedAt'][:10]}): {a['description']}")
    return "\n".join(summaries) if summaries else "No recent news found."
