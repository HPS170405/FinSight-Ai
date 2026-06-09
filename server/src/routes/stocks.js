const router = require('express').Router();
const auth = require('../middleware/auth');
const { getPrice, getHistory } = require('../controllers/stocksController');

router.get('/price/:ticker', auth, getPrice);
router.get('/history/:ticker', auth, getHistory);

module.exports = router;
