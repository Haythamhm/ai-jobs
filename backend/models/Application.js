const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Job',
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Interviewing', 'Hired', 'Rejected'],
      default: 'Pending',
    },
    coverLetter: {
      type: String,
    },
    // The specific resume PDF uploaded for this application
    resumeFile: {
      type: Buffer,
    },
    resumeText: {
      type: String,
    },
    resumeContentType: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true, // adds appliedAt (createdAt) and updatedAt automatically
  }
);

module.exports = mongoose.model('Application', applicationSchema);
