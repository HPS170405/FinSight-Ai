from crewai import Agent
from app.agents.tools.stock_tool import stock_data_tool
from app.agents.tools.news_tool import financial_news_tool

llm = "gemini/gemini-2.5-flash-lite"

# Agent 1: Research Agent — gathers raw data
research_agent = Agent(
    role="Financial Research Analyst",
    goal="Gather comprehensive stock data and recent news for {ticker}",
    backstory=(
        "You are a senior equity research analyst at a top investment bank. "
        "You specialize in gathering and synthesizing financial data from multiple sources."
    ),
    tools=[stock_data_tool, financial_news_tool],
    llm=llm,
    verbose=True
)

# Agent 2: Analysis Agent — runs analysis on the data
analysis_agent = Agent(
    role="Quantitative Analyst",
    goal="Analyze stock data and news to identify trends, risks, and opportunities for {ticker}",
    backstory=(
        "You are a quant analyst with 10 years of experience. "
        "You identify patterns in price data, assess risk factors, "
        "and translate data into clear investment insights."
    ),
    tools=[stock_data_tool],
    llm=llm,
    verbose=True
)

# Agent 3: Report Agent — writes the final report
report_agent = Agent(
    role="Equity Research Report Writer",
    goal="Write a professional, structured equity research report for {ticker}",
    backstory=(
        "You are a CFA charterholder who writes institutional-grade equity research reports. "
        "Your reports are clear, data-backed, and always include a risk section."
    ),
    tools=[],
    llm=llm,
    verbose=True
)
