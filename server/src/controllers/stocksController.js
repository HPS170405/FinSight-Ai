const axios = require('axios');

exports.getPrice = async (req, res) => {
  try {
    const { data } = await axios.get(`${process.env.ML_SERVICE_URL}/stocks/price/${req.params.ticker}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const days = req.query.days || 30;
    const { data } = await axios.get(`${process.env.ML_SERVICE_URL}/stocks/history/${req.params.ticker}?days=${days}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
