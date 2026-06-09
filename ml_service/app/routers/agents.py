import asyncio
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.report_generator import save_report_to_db
import time, random

router = APIRouter()

class ResearchRequest(BaseModel):
    ticker: str
    user_id: str

class ChatRequest(BaseModel):
    message: str
    user_id: str

async def _generate_report(ticker: str, user_id: str):
    """Generate research report via single LLM call and save to DB."""
    from crewai.llm import LLM
    loop = asyncio.get_event_loop()
    try:
        llm = LLM(model="gemini/gemini-2.5-flash-lite")
        prompt = (
            f"You are a senior equity research analyst. Write a professional equity research report for {ticker}. "
            "Include these sections: Executive Summary, Company Overview, Financial Data & Metrics, "
            "News Analysis & Sentiment, Risk Factors, Investment Thesis, Conclusion.\n\n"
            "STRICT TABLE FORMAT — EXACTLY these columns, no variations, no merged cells, no notes inside the table body:\n"
            "- Financial Data & Metrics table: | Metric | FY21 | FY22 | FY23 | FY24E | FY25E |\n"
            "  Exactly 6 columns. Use INR Cr for Indian stocks, USD B for US stocks.\n"
            "  Rows: Revenue, EBITDA/Operating Income, Net Profit, EPS, Debt-to-Equity, ROE%, Operating Cash Flow.\n"
            "  Do NOT add extra columns or merge columns. Put any notes BELOW the table, not in it.\n"
            "- Risk Factors table: | Risk Factor | Description | Impact | Mitigation |\n"
            "  Exactly 4 columns. Include 4-6 risks.\n"
            "- Both tables must use | pipes and --- alignment headers.\n"
            "- Put key takeaways as bullet points under Executive Summary.\n"
            "- Be data-driven, professional, and concise."
        )
        for attempt in range(5):
            try:
                report_md = await loop.run_in_executor(None, llm.call, prompt)
                break
            except Exception as e:
                if attempt < 4 and ("503" in str(e) or "429" in str(e)):
                    delay = (4 ** attempt) + random.uniform(0, 2)
                    await asyncio.sleep(delay)
                else:
                    raise
        await save_report_to_db(ticker, user_id, report_md)
    except Exception as e:
        print(f"Report generation failed for {ticker}: {e}")

@router.post("/run")
async def run_agents(req: ResearchRequest):
    job_id = f"{req.ticker}_{req.user_id}"
    asyncio.create_task(_generate_report(req.ticker, req.user_id))
    return {"job_id": job_id, "status": "started"}

@router.post("/chat")
async def chat(req: ChatRequest):
    """Simple RAG-powered chat using CrewAI LLM."""
    from crewai.llm import LLM
    import os, traceback
    loop = asyncio.get_event_loop()
    for attempt in range(3):
        try:
            llm = LLM(model="gemini/gemini-2.5-flash-lite")
            prompt = (
                f"You are a financial advisor. User question: '{req.message}'. "
                "Answer concisely and professionally using financial knowledge."
            )
            response = await loop.run_in_executor(None, llm.call, prompt)
            return {"reply": response, "sources": []}
        except Exception as e:
            if attempt < 2 and ("503" in str(e) or "429" in str(e)):
                delay = (4 ** attempt) + random.uniform(0, 1)
                await asyncio.sleep(delay)
            else:
                traceback.print_exc()
                from fastapi.responses import JSONResponse
                return JSONResponse(status_code=500, content={"error": str(e), "traceback": traceback.format_exc()})
