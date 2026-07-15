const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserImage,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/:id', getUserProfile);
router.get('/:id/image', getUserImage);
router.put('/profile', protect, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'resumeFile', maxCount: 1 }
]), updateUserProfile);

module.exports = router;
