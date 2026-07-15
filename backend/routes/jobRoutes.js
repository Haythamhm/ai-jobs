const express = require('express');
const router = express.Router();
const {
  getJobs,
  getManagerJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getJobs);
router.get('/manager/me', protect, authorize('manager'), getManagerJobs);
router.get('/:id', getJobById);

router.post('/', protect, authorize('manager'), createJob);
router.put('/:id', protect, authorize('manager'), updateJob);
router.delete('/:id', protect, authorize('manager'), deleteJob);

module.exports = router;
