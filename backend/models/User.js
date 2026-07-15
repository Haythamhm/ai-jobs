const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['candidate', 'manager'],
      default: 'candidate',
    },
    contactNumber: {
      type: String,
    },
    profileImage: {
      type: Buffer, // For small image uploads
    },
    profileImageContentType: {
      type: String,
    },
    candidateProfile: {
      title: String,
      fileName: String,
      rawResumeText: String,
      portfolioLinks: [String],
      yearsOfExperience: Number,
      // The resume PDF itself can be attached here, or in Applications
      resumeFile: Buffer,
      resumeContentType: String,
    },
  },
  {
    timestamps: true,
  }
);

// We won't add password hashing middleware here to keep it simple, we'll do it in the controller,
// or we can add a pre-save hook. Let's do it in the controller.

module.exports = mongoose.model('User', userSchema);
