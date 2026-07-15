const express = require('express');
const router = express.Router();
const { analyzeResume } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/analyze-resume', protect, authorize('manager'), analyzeResume);

module.exports = router;
