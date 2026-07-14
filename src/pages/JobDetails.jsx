import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building, DollarSign, Clock } from 'lucide-react';
import { getJobById, addApplication, getProfile } from '../lib/storage';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const foundJob = getJobById(id);
    if (foundJob) {
      setJob(foundJob);
    } else {
      navigate('/jobs');
    }
  }, [id, navigate]);

  const handleApply = () => {
    const profile = getProfile();
    if (!profile) {
      alert('Please complete your profile and upload a resume before applying.');
      navigate('/profile');
      return;
    }

    const success = addApplication(job);
    if (success) {
      alert('Application submitted successfully!');
      navigate('/applications');
    } else {
      alert('You have already applied for this job.');
    }
  };

  if (!job) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/jobs" className="inline-flex items-center text-slate-500 hover:text-primary-600 transition-colors mb-6">
        <ArrowLeft size={16} className="mr-2" /> Back to jobs
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
              <div className="flex flex-wrap items-center text-slate-500 gap-4 mt-4">
                <span className="flex items-center"><Building size={18} className="mr-1.5 text-slate-400"/> {job.company}</span>
                <span className="flex items-center"><MapPin size={18} className="mr-1.5 text-slate-400"/> {job.location}</span>
                <span className="flex items-center"><DollarSign size={18} className="mr-1.5 text-slate-400"/> {job.salary}</span>
                <span className="flex items-center"><Clock size={18} className="mr-1.5 text-slate-400"/> {job.posted}</span>
              </div>
            </div>
            <button 
              onClick={handleApply}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Apply Now
            </button>
          </div>
        </div>
        
        <div className="p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Job Description</h3>
          <div className="prose max-w-none text-slate-600">
            {job.description?.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
          {job.requirements && job.requirements.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-bold text-slate-800 mb-2">Requirements</h4>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                {job.requirements.map((req, i) => req && <li key={i}>{req}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
