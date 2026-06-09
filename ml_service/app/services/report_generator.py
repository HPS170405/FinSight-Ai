import asyncpg
import os

async def save_report_to_db(ticker: str, user_id: str, report_md: str):
    conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
    await conn.execute(
        """INSERT INTO reports (ticker, user_id, content, created_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (ticker, user_id) DO UPDATE SET content = $3, created_at = NOW()""",
        ticker, int(user_id), report_md
    )
    await conn.close()
