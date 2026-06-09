from crewai import Crew, Process
from app.agents.agents import research_agent, analysis_agent, report_agent
from app.agents.tasks import create_research_task, create_analysis_task, create_report_task
import time, random

def run_research_crew(ticker: str) -> str:
    """Run the full 3-agent research pipeline for a given ticker."""
    crew = Crew(
        agents=[research_agent, analysis_agent, report_agent],
        tasks=[
            create_research_task(ticker),
            create_analysis_task(ticker),
            create_report_task(ticker),
        ],
        process=Process.sequential,
        verbose=True
    )
    max_retries = 5
    for attempt in range(max_retries):
        try:
            result = crew.kickoff(inputs={"ticker": ticker})
            return str(result)
        except Exception as e:
            if attempt < max_retries - 1 and ("503" in str(e) or "429" in str(e)):
                delay = (4 ** attempt) + random.uniform(0, 2)
                print(f"Rate limited, retrying in {delay:.1f}s (attempt {attempt+1}/{max_retries})")
                time.sleep(delay)
            else:
                raise
