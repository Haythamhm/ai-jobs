const express = require('express');
const router = express.Router();
const { analyzeResume, organizeResume } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/analyze-resume', protect, authorize('manager'), analyzeResume);
router.post('/organize-resume', protect, organizeResume);

module.exports = router;
