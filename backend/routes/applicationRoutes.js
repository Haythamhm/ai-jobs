const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplicationResume,
  getManagerApplications,
  deleteApplication,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, authorize('candidate'), upload.fields([{ name: 'resumeFile', maxCount: 1 }]), submitApplication);
router.get('/me', protect, authorize('candidate'), getMyApplications);
router.get('/job/:jobId', protect, authorize('manager'), getJobApplications);
router.get('/manager', protect, authorize('manager'), getManagerApplications);
router.put('/:id/status', protect, authorize('manager'), updateApplicationStatus);
router.get('/:id/resume', protect, authorize('manager'), getApplicationResume);
router.delete('/:id', protect, authorize('manager'), deleteApplication);

module.exports = router;
