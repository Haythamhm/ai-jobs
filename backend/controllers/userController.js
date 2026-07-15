const User = require('../models/User');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public / Private based on needs
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      let candidateProfileData = req.body.candidateProfile;
      if (typeof candidateProfileData === 'string') {
        try {
          candidateProfileData = JSON.parse(candidateProfileData);
        } catch (e) {
          console.error('Failed to parse candidateProfile JSON string', e);
        }
      }
      
      console.log('--- DEBUG USER CONTROLLER ---');
      console.log('Incoming candidateProfileData:', candidateProfileData);
      console.log('req.body:', req.body);
      console.log('-----------------------------');

      if (candidateProfileData) {
        if (candidateProfileData.name) {
          const parts = candidateProfileData.name.trim().split(/\s+/);
          user.firstName = parts[0] || user.firstName;
          user.lastName = parts.slice(1).join(' ') || '';
        }
        if (candidateProfileData.email) {
          user.email = candidateProfileData.email;
        }
        if (candidateProfileData.phone) {
          user.contactNumber = candidateProfileData.phone;
        }
      }

      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.contactNumber = req.body.contactNumber || user.contactNumber;

      if (user.role === 'candidate' && candidateProfileData) {
        const { name, email, phone, ...profileFields } = candidateProfileData;
        user.candidateProfile = {
          title: profileFields.title || (user.candidateProfile && user.candidateProfile.title) || '',
          fileName: profileFields.fileName || (user.candidateProfile && user.candidateProfile.fileName) || '',
          rawResumeText: profileFields.extractedText || profileFields.rawResumeText || (user.candidateProfile && user.candidateProfile.rawResumeText) || '',
          portfolioLinks: profileFields.portfolioLinks || (user.candidateProfile && user.candidateProfile.portfolioLinks) || [],
          yearsOfExperience: Number(profileFields.yearsOfExperience) || (user.candidateProfile && user.candidateProfile.yearsOfExperience) || 0,
          resumeFile: (user.candidateProfile && user.candidateProfile.resumeFile),
          resumeContentType: (user.candidateProfile && user.candidateProfile.resumeContentType)
        };
      }

      // Handle profile image upload if provided (using multer memory storage)
      if (req.files && req.files['profileImage']) {
        user.profileImage = req.files['profileImage'][0].buffer;
        user.profileImageContentType = req.files['profileImage'][0].mimetype;
      }

      // Handle resume PDF upload if provided
      if (req.files && req.files['resumeFile']) {
        user.candidateProfile.resumeFile = req.files['resumeFile'][0].buffer;
        user.candidateProfile.resumeContentType = req.files['resumeFile'][0].mimetype;
      }

      const updatedUser = await user.save();
      
      // Exclude binary data from response JSON
      const cleanProfile = updatedUser.candidateProfile ? {
        ...updatedUser.candidateProfile.toObject(),
        resumeFile: undefined
      } : undefined;
      
      res.status(200).json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        contactNumber: updatedUser.contactNumber,
        candidateProfile: cleanProfile,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile image
// @route   GET /api/users/:id/image
// @access  Public
const getUserImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.profileImage) {
      res.status(404);
      throw new Error('Image not found');
    }
    res.set('Content-Type', user.profileImageContentType);
    res.send(user.profileImage);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserImage,
};
