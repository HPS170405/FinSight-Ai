const router = require('express').Router();
const auth = require('../middleware/auth');
const { getPortfolio, addStock, deleteStock, uploadCSV } = require('../controllers/portfolioController');

router.get('/', auth, getPortfolio);
router.post('/stock', auth, addStock);
router.delete('/stock/:ticker', auth, deleteStock);
// router.post('/upload', auth, uploadCSV); // Unused in this guide, placeholder

module.exports = router;
