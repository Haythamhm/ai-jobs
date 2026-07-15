const multer = require('multer');

// Configure multer to use memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(pdf|doc|docx|png|jpg|jpeg)$/)) {
      return cb(new Error('Please upload a valid document or image'));
    }
    cb(undefined, true);
  },
});

module.exports = upload;
