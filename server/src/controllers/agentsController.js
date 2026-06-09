const axios = require('axios');
const db = require('../config/db');

exports.runResearch = async (req, res) => {
  const { ticker } = req.params;
  try {
    // Trigger the CrewAI pipeline (async — returns job ID)
    const { data } = await axios.post(
      `${process.env.ML_SERVICE_URL}/agents/run`,
      { ticker, user_id: String(req.user.id) }
    );
    res.json({ job_id: data.job_id, message: 'Research started' });
  } catch (err) {
    const detail = err.response?.data?.error || err.message;
    res.status(err.response?.status || 500).json({ error: detail });
  }
};

exports.getReport = async (req, res) => {
  const { ticker } = req.params;
  try {
    const { rows } = await db.query(
      'SELECT * FROM reports WHERE ticker = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1',
      [ticker, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No report found' });
    res.json({ report: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
