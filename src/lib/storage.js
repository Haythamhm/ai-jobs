const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

async function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Check role dynamically based on path
function getRoleByPath() {
  return window.location.pathname.startsWith('/manager') ? 'manager' : 'candidate';
}

const formatPostedDate = (createdAt) => {
  if (!createdAt) return 'Recently';
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = now - created;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.floor(diffTime / (1000 * 60));
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    }
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

// ─── JOBS ─────────────────────────────────────────────────────────────────────

export const getJobs = async () => {
  try {
    const role = getRoleByPath();
    const headers = await getAuthHeaders(role);
    
    // Managers should see all jobs they created
    const url = role === 'manager' 
      ? `${API_URL}/jobs/manager/me` 
      : `${API_URL}/jobs`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Failed to fetch jobs');
    const data = await res.json();
    // Normalize properties to match what UI expects
    return data.map(job => ({
      id: job._id,
      title: job.title,
      company: job.managerId?.companyName || (job.managerId && typeof job.managerId === 'object' ? `${job.managerId.firstName} ${job.managerId.lastName}` : 'Matchr Client'),
      location: job.location,
      salary: job.salaryRange || 'Unspecified',
      type: job.employmentType,
      requirements: job.requiredSkills || [],
      tags: job.requiredSkills?.slice(0, 3) || [],
      description: job.description,
      posted: formatPostedDate(job.createdAt)
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getJobById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/jobs/${id}`);
    if (!res.ok) throw new Error('Job not found');
    const job = await res.json();
    return {
      id: job._id,
      title: job.title,
      company: job.managerId?.companyName || (job.managerId && typeof job.managerId === 'object' ? `${job.managerId.firstName} ${job.managerId.lastName}` : 'Matchr Client'),
      location: job.location,
      salary: job.salaryRange || 'Unspecified',
      type: job.employmentType,
      requirements: job.requiredSkills || [],
      tags: job.requiredSkills?.slice(0, 3) || [],
      description: job.description,
      posted: formatPostedDate(job.createdAt)
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const addJob = async (job) => {
  const headers = await getAuthHeaders('manager');
  const body = {
    title: job.title,
    department: job.department || 'Engineering',
    location: job.location,
    employmentType: job.type,
    description: job.description,
    requiredSkills: job.requirements || [],
    salaryRange: job.salary,
    status: 'Published'
  };
  
  const res = await fetch(`${API_URL}/jobs`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  });
  
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to add job');
  }
  
  const newJob = await res.json();
  return {
    id: newJob._id,
    ...job
  };
};

export const updateJob = async (id, updatedJob) => {
  const headers = await getAuthHeaders('manager');
  const body = {
    title: updatedJob.title,
    department: updatedJob.department || 'Engineering',
    location: updatedJob.location,
    employmentType: updatedJob.type,
    description: updatedJob.description,
    requiredSkills: updatedJob.requirements || [],
    salaryRange: updatedJob.salary,
    status: 'Published'
  };
  
  const res = await fetch(`${API_URL}/jobs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  });
  
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to update job');
  }
};

export const deleteJob = async (id) => {
  const headers = await getAuthHeaders('manager');
  const res = await fetch(`${API_URL}/jobs/${id}`, {
    method: 'DELETE',
    headers
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to delete job');
  }
};

// ─── CANDIDATE PROFILE ────────────────────────────────────────────────────────

export const getProfile = async () => {
  try {
    const headers = await getAuthHeaders('candidate');
    const res = await fetch(`${API_URL}/auth/me`, { headers });
    if (!res.ok) throw new Error('Failed to fetch profile');
    const user = await res.json();
    
    return {
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      phone: user.contactNumber || '',
      experience: user.candidateProfile?.yearsOfExperience || 0,
      portfolio: user.candidateProfile?.portfolioLinks?.[0] || '',
      extractedText: user.candidateProfile?.rawResumeText || '',
      title: user.candidateProfile?.title || '',
      fileName: user.candidateProfile?.fileName || '',
      ...user.candidateProfile
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const saveProfile = async (profile, file) => {
  const headers = await getAuthHeaders('candidate');
  const formData = new FormData();
  
  const candidateProfileData = {
    ...profile,
    rawResumeText: profile.extractedText || profile.rawResumeText || '',
    portfolioLinks: profile.portfolio ? [profile.portfolio] : [],
    yearsOfExperience: Number(profile.experience) || 0,
  };
  
  formData.append('candidateProfile', JSON.stringify(candidateProfileData));
  
  if (file && file instanceof File) {
    formData.append('resumeFile', file);
  }
  
  const res = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      ...headers
    },
    body: formData
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to save profile');
  }
};

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────

export const getApplications = async () => {
  try {
    const role = getRoleByPath();
    const headers = await getAuthHeaders(role);
    
    const url = role === 'manager'
      ? `${API_URL}/applications/manager`
      : `${API_URL}/applications/me`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Failed to fetch applications');
    const data = await res.json();
    
    // Normalize to UI expectation
    return data.map(app => {
      let uiStatus = app.status || 'Pending';
      if (app.status === 'Reviewed') uiStatus = 'In Review';
      else if (app.status === 'Interviewing') uiStatus = 'Interview';
      
      return {
        id: app._id,
        jobId: app.jobId?._id || '',
        jobTitle: app.jobId?.title || 'Unknown Job',
        company: app.jobId?.companyName || 'Matchr Client',
        candidateName: app.candidateId ? `${app.candidateId.firstName} ${app.candidateId.lastName}` : 'Anonymous Candidate',
        candidateEmail: app.candidateId?.email || '',
        candidatePhone: app.candidateId?.contactNumber || '',
        candidateProfile: app.candidateId?.candidateProfile || null,
        resumeText: app.resumeText || '',
        status: uiStatus,
        date: new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: app.jobId?.employmentType || 'Full-time'
      };
    });
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const addApplication = async (job, newFile, resumeText = '') => {
  const headers = await getAuthHeaders('candidate');
  let res;
  
  if (newFile && newFile instanceof File) {
    const formData = new FormData();
    formData.append('jobId', job.id);
    formData.append('resumeFile', newFile);
    if (resumeText) formData.append('resumeText', resumeText);
    
    res = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: {
        ...headers
      },
      body: formData
    });
  } else {
    res = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({ jobId: job.id, resumeText })
    });
  }
  
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to submit application');
  }
  const newApp = await res.json();
  return {
    id: newApp._id,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    status: newApp.status,
    date: new Date(newApp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    type: job.type
  };
};

export const updateApplicationStatus = async (id, status) => {
  // Map frontend status to DB enum values
  let dbStatus = status;
  if (status === 'In Review') dbStatus = 'Reviewed';
  else if (status === 'Interview') dbStatus = 'Interviewing';

  const headers = await getAuthHeaders('manager');
  const res = await fetch(`${API_URL}/applications/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify({ status: dbStatus })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to update application status');
  }
};

export const deleteApplication = async (id) => {
  const headers = await getAuthHeaders('manager');
  const res = await fetch(`${API_URL}/applications/${id}`, {
    method: 'DELETE',
    headers
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to delete application');
  }
};
