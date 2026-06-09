from crewai import Task
from app.agents.agents import research_agent, analysis_agent, report_agent

def create_research_task(ticker: str) -> Task:
    return Task(
        description=(
            f"Research {ticker} stock. Use the Stock Data Fetcher to get price history "
            f"and the Financial News Fetcher to get the latest 5 news articles. "
            f"Summarize the key data points."
        ),
        expected_output=(
            "A structured summary with: current price, recent price trend, "
            "trading volume trend, and 5 recent news headlines with brief summaries."
        ),
        agent=research_agent
    )

def create_analysis_task(ticker: str) -> Task:
    return Task(
        description=(
            f"Using the research data collected for {ticker}, perform a detailed analysis. "
            "Identify: (1) price momentum direction, (2) key risk factors from news, "
            "(3) anomaly/unusual price movements, (4) overall sentiment (bullish/bearish/neutral)."
        ),
        expected_output=(
            "An analysis report with sections: Price Analysis, News Sentiment, "
            "Risk Factors, and an overall Outlook (Bullish/Neutral/Bearish with rationale)."
        ),
        agent=analysis_agent
    )

def create_report_task(ticker: str) -> Task:
    return Task(
        description=(
            f"Write a professional equity research report for {ticker} "
            "using the research and analysis provided. "
            "Format: Executive Summary, Company Overview, Financial Data, "
            "News Analysis, Risk Factors, Investment Thesis, Conclusion."
        ),
        expected_output=(
            "A complete, well-structured equity research report in Markdown format. "
            "Must be minimum 400 words, professional tone, with clear sections."
        ),
        agent=report_agent
    )
