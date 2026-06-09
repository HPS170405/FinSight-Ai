const axios = require('axios');

exports.chat = async (req, res) => {
  const { message } = req.body;
  try {
    const { data } = await axios.post(
      `${process.env.ML_SERVICE_URL}/agents/chat`,
      { message, user_id: String(req.user.id) }
    );
    res.json({ reply: data.reply, sources: data.sources });
  } catch (err) {
    const detail = err.response?.data?.error || err.message;
    res.status(err.response?.status || 500).json({ error: detail });
  }
};
