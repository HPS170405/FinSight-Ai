const db = require('../config/db');
const axios = require('axios');

exports.getPortfolio = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM portfolio_stocks WHERE user_id = $1',
      [req.user.id]
    );

    // Enrich with live prices from ML service
    const enriched = await Promise.all(rows.map(async (stock) => {
      try {
        const { data } = await axios.get(
          `${process.env.ML_SERVICE_URL}/stocks/price/${stock.ticker}`,
          { timeout: 5000 }
        );
        const price = data.price && data.price > 0 ? data.price : stock.buy_price;
        return { ...stock, current_price: price, change_pct: data.change_pct || 0 };
      } catch (e) {
        return { ...stock, current_price: stock.buy_price, change_pct: 0 };
      }
    }));

    res.json({ portfolio: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addStock = async (req, res) => {
  const { ticker, quantity, buy_price } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO portfolio_stocks (user_id, ticker, quantity, buy_price)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, ticker) DO UPDATE SET
         quantity = EXCLUDED.quantity,
         buy_price = EXCLUDED.buy_price
       RETURNING *`,
      [req.user.id, ticker.toUpperCase(), quantity, buy_price]
    );
    res.status(201).json({ stock: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteStock = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM portfolio_stocks WHERE user_id = $1 AND ticker = $2',
      [req.user.id, req.params.ticker]
    );
    res.json({ message: 'Stock removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
