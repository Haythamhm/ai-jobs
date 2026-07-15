import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getApplications, getJobById } from '../lib/storage';

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      const apps = await getApplications();
      const foundApp = apps.find(a => a.id === id);
      if (foundApp) {
        setApplication(foundApp);
        const foundJob = await getJobById(foundApp.jobId);
        if (foundJob) setJob(foundJob);
      } else {
        navigate('/applications');
      }
    };
    loadDetails();
  }, [id, navigate]);

  if (!application) return <div className="p-8 text-center">Loading...</div>;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'In Review': return <Clock className="text-yellow-500" size={24} />;
      case 'Interview': return <CheckCircle className="text-primary-500" size={24} />;
      case 'Hired': return <CheckCircle className="text-emerald-500" size={24} />;
      case 'Rejected': return <XCircle className="text-rose-500" size={24} />;
      default: return <Clock className="text-slate-400" size={24} />;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'In Review': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'Interview': return 'bg-primary-50 border-primary-200 text-primary-700';
      case 'Hired': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'Rejected': return 'bg-rose-50 border-rose-200 text-rose-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/applications" className="inline-flex items-center text-slate-500 hover:text-primary-600 transition-colors mb-6">
        <ArrowLeft size={16} className="mr-2" /> Back to My Applications
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{application.jobTitle}</h1>
            <div className="flex items-center gap-4 text-slate-500 mt-2">
              <span className="flex items-center gap-1"><Building size={18} /> {application.company}</span>
              <span>•</span>
              <span>Applied on {application.date}</span>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-5 py-2 rounded-full border font-bold ${getStatusBg(application.status)}`}>
            {getStatusIcon(application.status)}
            {application.status}
          </div>
        </div>

        <div className="p-8 bg-slate-50">
          <h3 className="font-bold text-slate-800 mb-4 text-lg">Application Timeline</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle className="text-green-500" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Application Submitted</h4>
                <p className="text-slate-500 text-sm">Your resume and profile were successfully sent to {application.company}.</p>
                <span className="text-xs text-slate-400 mt-1 block">{application.date}</span>
              </div>
            </div>
            
            {application.status !== 'Pending' && (
              <div className="flex gap-4">
                <div className="mt-1">
                  {application.status === 'In Review' ? (
                    <div className="w-5 h-5 rounded-full border-2 border-primary-500 bg-primary-100"></div>
                  ) : (
                    <CheckCircle className="text-green-500" size={20} />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Under Review</h4>
                  <p className="text-slate-500 text-sm">The hiring team is currently reviewing your application.</p>
                </div>
              </div>
            )}

            {application.status !== 'In Review' && application.status !== 'Pending' && (
              <div className="flex gap-4">
                <div className="mt-1">
                   {getStatusIcon(application.status)}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">
                    {application.status === 'Interview' && 'Interview Scheduled'}
                    {application.status === 'Hired' && 'Hired / Offer Extended'}
                    {application.status === 'Rejected' && 'Application Rejected'}
                  </h4>
                  <p className="text-slate-500 text-sm">
                    {application.status === 'Interview' && 'Congratulations! The company has invited you to an interview.'}
                    {application.status === 'Hired' && 'Great news! The company has decided to make you an offer.'}
                    {application.status === 'Rejected' && 'Unfortunately, the company decided to move forward with other candidates.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {job && (
          <div className="p-8 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Original Job Description</h3>
            <div className="prose max-w-none text-slate-600 text-sm">
              {job.description?.split('\n').map((line, i) => (
                <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
            <Link to={`/jobs/${job.id}`} className="inline-block mt-4 text-primary-600 font-semibold hover:underline">
              View full job details &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
