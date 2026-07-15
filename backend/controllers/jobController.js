const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get all published jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'Published' }).populate('managerId', 'firstName lastName companyName');
    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get manager's jobs
// @route   GET /api/jobs/manager/me
// @access  Private (Manager)
const getManagerJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ managerId: req.user._id });
    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single job
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('managerId', 'firstName lastName companyName');
    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }
    res.status(200).json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Manager)
const createJob = async (req, res, next) => {
  try {
    const jobData = {
      ...req.body,
      managerId: req.user._id,
    };
    const job = await Job.create(jobData);
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Manager)
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    if (job.managerId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Manager)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    if (job.managerId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ jobId: req.params.id });
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getManagerJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};
