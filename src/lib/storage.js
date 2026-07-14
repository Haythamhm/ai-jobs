const INITIAL_JOBS = [
  { id: '1', title: 'Senior Frontend Engineer', company: 'TechCorp', location: 'Remote', salary: '$120k - $150k', type: 'Full-time', tags: ['React', 'TypeScript', 'Tailwind'], description: 'We are looking for a Senior Frontend Engineer to join our core product team.', requirements: ['React', 'TypeScript'] },
  { id: '2', title: 'Product Manager', company: 'InnovateInc', location: 'New York, NY', salary: '$130k - $160k', type: 'Full-time', tags: ['Agile', 'Product Strategy'], description: 'Lead our product vision and execution.', requirements: ['Agile', 'Leadership'] },
  { id: '3', title: 'UX Designer', company: 'Designify', location: 'Remote', salary: '$90k - $120k', type: 'Contract', tags: ['Figma', 'User Research'], description: 'Design beautiful and intuitive user experiences.', requirements: ['Figma', 'Prototyping'] },
];

export const getJobs = () => {
  const jobs = localStorage.getItem('ai_jobs');
  if (!jobs) {
    localStorage.setItem('ai_jobs', JSON.stringify(INITIAL_JOBS));
    return INITIAL_JOBS;
  }
  return JSON.parse(jobs);
};

export const getJobById = (id) => {
  const jobs = getJobs();
  return jobs.find(job => job.id === id);
};

export const addJob = (job) => {
  const jobs = getJobs();
  const newJob = {
    ...job,
    id: Date.now().toString(),
    tags: job.requirements.slice(0, 3), // mock generating tags from requirements
  };
  jobs.push(newJob);
  localStorage.setItem('ai_jobs', JSON.stringify(jobs));
  return newJob;
};

export const updateJob = (id, updatedJob) => {
  const jobs = getJobs();
  const index = jobs.findIndex(job => job.id === id);
  if (index !== -1) {
    jobs[index] = { ...jobs[index], ...updatedJob, tags: updatedJob.requirements?.slice(0, 3) || [] };
    localStorage.setItem('ai_jobs', JSON.stringify(jobs));
  }
};

export const deleteJob = (id) => {
  let jobs = getJobs();
  jobs = jobs.filter(job => job.id !== id);
  localStorage.setItem('ai_jobs', JSON.stringify(jobs));
};

export const getProfile = () => {
  const profile = localStorage.getItem('ai_candidate_profile');
  return profile ? JSON.parse(profile) : null;
};

export const saveProfile = (profile) => {
  localStorage.setItem('ai_candidate_profile', JSON.stringify(profile));
};

export const getApplications = () => {
  const apps = localStorage.getItem('ai_applications');
  return apps ? JSON.parse(apps) : [];
};

export const addApplication = (job) => {
  const apps = getApplications();
  
  // Prevent duplicate applications
  if (apps.some(app => app.jobId === job.id)) {
    return false;
  }

  const newApp = {
    id: Date.now().toString(),
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    status: 'In Review',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    type: job.type
  };
  
  apps.push(newApp);
  localStorage.setItem('ai_applications', JSON.stringify(apps));
  return newApp;
};

export const updateApplicationStatus = (id, status) => {
  const apps = getApplications();
  const index = apps.findIndex(app => app.id === id);
  if (index !== -1) {
    apps[index].status = status;
    localStorage.setItem('ai_applications', JSON.stringify(apps));
  }
};
