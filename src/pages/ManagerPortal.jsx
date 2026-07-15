import { useState, useEffect } from 'react';
import { Users, Star, FileText, Plus, Search, Edit2, Trash2, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getJobs, deleteJob, getApplications, updateApplicationStatus, getProfile, getJobById, deleteApplication } from '../lib/storage';
import { analyzeCandidate } from '../lib/aiService';
import { useToast } from '../context/ToastContext';

const STATUS_OPTIONS = ['In Review', 'Interview', 'Hired', 'Rejected'];

const getStatusBadge = (status) => {
  switch (status) {
    case 'In Review':
    case 'Reviewed': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    case 'Interview':
    case 'Interviewing': return 'bg-teal-50 border-teal-200 text-teal-700';
    case 'Hired': return 'bg-green-50 border-green-200 text-green-700';
    case 'Rejected': return 'bg-red-50 border-red-200 text-red-700';
    default: return 'bg-slate-100 border-slate-200 text-slate-600';
  }
};

// Simple AI score: % of job requirements found in profile text
const computeScore = (job, profileText) => {
  if (!job?.requirements?.length || !profileText) return null;
  const text = profileText.toLowerCase();
  const matched = job.requirements.filter(r => r && text.includes(r.toLowerCase()));
  return Math.round((matched.length / job.requirements.length) * 100);
};

export default function ManagerPortal() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('jobs');

  // Jobs
  const [jobs, setJobs] = useState([]);
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('All');
  const navigate = useNavigate();

  // Applications
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [appSearchTerm, setAppSearchTerm] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('All');
  const [profile, setProfile] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  // AI analysis state
  const [aiResult, setAiResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const allJobs = await getJobs();
      setJobs(allJobs);
      const apps = await getApplications();
      setApplications(apps);
      const prof = await getProfile();
      setProfile(prof);
    };
    loadData();
  }, []);

  // When selected app changes, load its job and run AI analysis
  useEffect(() => {
    const loadSelectedJob = async () => {
      if (selectedApp) {
        const job = await getJobById(selectedApp.jobId);
        setSelectedJob(job);

        // Run AI analysis
        const resumeText = selectedApp?.resumeText || '';
        if (job) {
          setAiResult(null);
          setIsAnalyzing(true);
          analyzeCandidate(resumeText, job)
            .then(result => setAiResult(result))
            .finally(() => setIsAnalyzing(false));
        }
      } else {
        setSelectedJob(null);
        setAiResult(null);
      }
    };
    loadSelectedJob();
  }, [selectedApp]);

  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job offer?')) {
      try {
        await deleteJob(id);
        const allJobs = await getJobs();
        setJobs(allJobs);
        showToast('Job offer deleted successfully.', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to delete job offer.', 'error');
      }
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      const updated = await getApplications();
      setApplications(updated);
      setSelectedApp(updated.find(a => a.id === appId) || null);
      showToast(`Application status updated to "${newStatus}".`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update application status.', 'error');
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteApplication(appId);
        const updated = await getApplications();
        setApplications(updated);
        setSelectedApp(null);
        showToast('Application deleted successfully.', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to delete application.', 'error');
      }
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(jobSearchTerm.toLowerCase());
    const matchesType = jobTypeFilter === 'All' || job.type === jobTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredApps = applications.filter(app => {
    const matchesSearch =
      app.jobTitle.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(appSearchTerm.toLowerCase());
    const matchesStatus = appStatusFilter === 'All' || app.status === appStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const profileText = profile ? `${profile.title || ''} ${profile.extractedText || ''}` : '';

  // Derive display values from aiResult
  const aiScore       = aiResult?.score ?? null;
  const matchedSkills = aiResult?.matchedSkills ?? [];
  const missingSkills = aiResult?.missingSkills ?? [];
  const recommendation = aiResult?.recommendation ?? null;
  const analysisSource = aiResult?.source ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-4rem)]">

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 font-semibold text-sm rounded-lg transition-colors ${activeTab === 'jobs' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Manage Jobs
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'applications' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Review Applications
          {applications.length > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === 'applications' ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-700'}`}>
              {applications.length}
            </span>
          )}
        </button>
      </div>

      {/* ── JOBS TAB ── */}
      {activeTab === 'jobs' && (
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search job offers..."
                  value={jobSearchTerm}
                  onChange={e => setJobSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <select
                value={jobTypeFilter}
                onChange={e => setJobTypeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-700 text-sm"
              >
                <option value="All">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <Link to="/manager/jobs/new" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
              <Plus size={16} /> Post New Job
            </Link>
          </div>

          <div className="space-y-3">
            {filteredJobs.map(job => {
              const appCount = applications.filter(a => a.jobId === job.id).length;
              return (
                <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{job.title}</h3>
                    <div className="text-sm text-slate-500 mt-1 flex gap-3 flex-wrap">
                      <span>{job.location || 'No location'}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                      <span>•</span>
                      <span>Posted {job.posted}</span>
                      {appCount > 0 && (
                        <>
                          <span>•</span>
                          <span
                            className="text-teal-600 font-semibold cursor-pointer hover:underline"
                            onClick={() => { setActiveTab('applications'); setAppSearchTerm(job.title); }}
                          >
                            {appCount} application{appCount > 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/manager/jobs/edit/${job.id}`)}
                      className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Edit Job"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Job"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredJobs.length === 0 && (
              <div className="text-center py-12 text-slate-400">No jobs found matching your filters.</div>
            )}
          </div>
        </div>
      )}

      {/* ── APPLICATIONS TAB ── */}
      {activeTab === 'applications' && (
        <div className="flex flex-1 overflow-hidden gap-6">

          {/* Left: Applications List */}
          <div className="w-80 flex-shrink-0 flex flex-col overflow-hidden">
            {/* Search + filter */}
            <div className="space-y-2 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search applicants..."
                  value={appSearchTerm}
                  onChange={e => setAppSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <select
                value={appStatusFilter}
                onChange={e => setAppStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

             {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredApps.map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                const score = computeScore(job, app.candidateProfile?.rawResumeText);
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedApp?.id === app.id ? 'border-teal-500 bg-teal-50 shadow-sm' : 'border-slate-200 bg-white hover:border-teal-300'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{app.candidateName}</h3>
                      {score !== null && (
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${score >= 70 ? 'bg-green-100 text-green-700' : score >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {score}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{app.jobTitle}</p>
                    <div className={`mt-2 inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-semibold ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </div>
                  </div>
                );
              })}
              {filteredApps.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  {applications.length === 0 ? 'No applications yet.' : 'No matches found.'}
                </div>
              )}
            </div>
          </div>

          {/* Right: Candidate Review Panel */}
          <div className="flex-1 overflow-y-auto">
            {selectedApp ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900">{selectedApp.candidateName}</h2>
                        <button
                          onClick={() => handleDeleteApplication(selectedApp.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Application"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      {selectedApp.candidateEmail && <p className="text-slate-500 text-sm">{selectedApp.candidateEmail}</p>}
                      {selectedApp.candidatePhone && <p className="text-slate-400 text-xs mt-0.5">Phone: {selectedApp.candidatePhone}</p>}
                      <p className="text-slate-500 mt-1">
                        Applied for: <span className="font-semibold text-slate-700">{selectedApp.jobTitle}</span>
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">Applied on {selectedApp.date}</p>
                    </div>

                    {/* Status Changer */}
                    <div className="flex flex-col items-end gap-2">
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border font-semibold text-sm ${getStatusBadge(selectedApp.status)}`}>
                        {selectedApp.status}
                      </div>
                      <div className="flex gap-2">
                        {STATUS_OPTIONS.filter(s => s !== selectedApp.status).map(s => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(selectedApp.id, s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              s === 'Interview' ? 'border-teal-300 text-teal-700 hover:bg-teal-50' :
                              s === 'Rejected' ? 'border-red-300 text-red-700 hover:bg-red-50' :
                              s === 'Hired' ? 'border-green-300 text-green-700 hover:bg-green-50' :
                              'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                            }`}
                          >
                            → {s === 'Hired' ? 'Accept / Hire' : s === 'Rejected' ? 'Reject / Refuse' : s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-grow overflow-y-auto space-y-6">
                {/* AI Score */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                      <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
                        <Star size={18} />
                        AI Compatibility Score
                        {analysisSource && (
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                            analysisSource === 'ai' ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {analysisSource === 'ai' ? '✦ AI' : 'Basic'}
                          </span>
                        )}
                      </div>
                      {isAnalyzing ? (
                        <div className="flex items-center gap-2 text-indigo-400 py-2">
                          <Loader size={20} className="animate-spin" />
                          <span className="text-sm">Analyzing resume...</span>
                        </div>
                      ) : aiScore !== null ? (
                        <>
                          <div className="text-4xl font-extrabold text-indigo-900">{aiScore}<span className="text-xl font-semibold text-indigo-400">/100</span></div>
                          <div className="mt-2 h-2 bg-indigo-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${aiScore}%` }} />
                          </div>
                        </>
                      ) : (
                        <p className="text-indigo-400 text-sm">No profile data available to compute score.</p>
                      )}
                    </div>

                    {/* Skills Analysis */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                      <h4 className="font-bold text-slate-700 mb-3">Skills Analysis</h4>
                      {isAnalyzing ? (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Loader size={16} className="animate-spin" />
                          <span className="text-sm">Matching skills...</span>
                        </div>
                      ) : selectedJob?.requirements?.length > 0 ? (
                        <div className="space-y-1.5">
                          {matchedSkills.map(skill => (
                            <div key={skill} className="flex items-center gap-2 text-sm text-green-700">
                              <span className="text-green-500 font-bold">✓</span> {skill}
                            </div>
                          ))}
                          {missingSkills.map(skill => (
                            <div key={skill} className="flex items-center gap-2 text-sm text-red-600">
                              <span className="text-red-400 font-bold">✗</span> {skill}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-sm">No requirements set for this job.</p>
                      )}
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  {(isAnalyzing || recommendation) && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                      <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <Star size={16} /> AI Recommendation
                      </h4>
                      {isAnalyzing ? (
                        <div className="flex items-center gap-2 text-amber-400">
                          <Loader size={16} className="animate-spin" />
                          <span className="text-sm">Generating recommendation...</span>
                        </div>
                      ) : (
                        <p className="text-amber-700 text-sm leading-relaxed">{recommendation}</p>
                      )}
                    </div>
                  )}

                  {/* Resume Text */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <FileText size={18} /> Extracted Resume Content
                    </h3>
                    {selectedApp?.resumeText ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 font-mono text-sm text-slate-600 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {selectedApp.resumeText}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400">
                        <FileText size={32} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">The candidate hasn't uploaded a resume yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Users size={64} className="mb-4 text-slate-300" />
                <p className="text-lg">Select an application to review</p>
                <p className="text-sm mt-1">AI analysis and resume will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
