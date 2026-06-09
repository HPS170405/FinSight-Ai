const router = require('express').Router();
const auth = require('../middleware/auth');
const { runResearch, getReport } = require('../controllers/agentsController');

router.post('/research/:ticker', auth, runResearch);
router.get('/report/:ticker', auth, getReport);

module.exports = router;
