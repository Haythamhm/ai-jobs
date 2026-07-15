const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Submit an application
// @route   POST /api/applications
// @access  Private (Candidate)
const submitApplication = async (req, res, next) => {
  try {
    const { jobId, coverLetter, notes } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    const applicationData = {
      jobId,
      candidateId: req.user._id,
      coverLetter,
      notes,
    };

    if (req.files && req.files['resumeFile']) {
      applicationData.resumeFile = req.files['resumeFile'][0].buffer;
      applicationData.resumeContentType = req.files['resumeFile'][0].mimetype;
      // If a new resume is uploaded, expect the extracted text in req.body.resumeText
      applicationData.resumeText = req.body.resumeText || '';
    } else {
      if (req.user && req.user.candidateProfile) {
        applicationData.resumeFile = req.user.candidateProfile.resumeFile;
        applicationData.resumeContentType = req.user.candidateProfile.resumeContentType;
        applicationData.resumeText = req.user.candidateProfile.rawResumeText || '';
      }
    }

    const application = await Application.create(applicationData);
    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id }).populate('jobId', 'title department location status');
    
    // Clean up and filter out applications whose jobs no longer exist
    const orphans = applications.filter(app => !app.jobId);
    if (orphans.length > 0) {
      const orphanIds = orphans.map(app => app._id);
      await Application.deleteMany({ _id: { $in: orphanIds } });
    }

    const activeApplications = applications.filter(app => app.jobId);
    res.status(200).json(activeApplications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for a job
// @route   GET /api/applications/job/:jobId
// @access  Private (Manager)
const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    if (job.managerId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const applications = await Application.find({ jobId: req.params.jobId }).populate('candidateId', 'firstName lastName email contactNumber profileImage profileImageContentType');
    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Manager)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    if (application.jobId.managerId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    application.status = status;
    const updatedApplication = await application.save();
    res.status(200).json(updatedApplication);
  } catch (error) {
    next(error);
  }
};

// @desc    Get application resume
// @route   GET /api/applications/:id/resume
// @access  Private (Manager)
const getApplicationResume = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application || !application.resumeFile) {
      res.status(404);
      throw new Error('Resume not found');
    }

    // Only allow manager of the job to download it
    if (application.jobId.managerId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    res.set('Content-Type', application.resumeContentType);
    res.send(application.resumeFile);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for jobs posted by the logged-in manager
// @route   GET /api/applications/manager
// @access  Private (Manager)
const getManagerApplications = async (req, res, next) => {
  try {
    const jobs = await Job.find({ managerId: req.user._id });
    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title department location status')
      .populate('candidateId', 'firstName lastName email contactNumber candidateProfile');
    
    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};
// @desc    Delete an application
// @route   DELETE /api/applications/:id
// @access  Private (Manager)
const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Only allow manager of the job to delete it
    if (application.jobId.managerId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await Application.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Application removed successfully' });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  submitApplication,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplicationResume,
  getManagerApplications,
  deleteApplication,
};
