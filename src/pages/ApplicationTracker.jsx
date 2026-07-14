import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, ChevronRight, Building, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getApplications } from '../lib/storage';

const STATUS_FILTERS = ['All', 'In Review', 'Interview', 'Rejected'];

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');

  useEffect(() => {
    setApplications(getApplications());
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'In Review': return <Clock className="text-yellow-500" size={20} />;
      case 'Interview': return <CheckCircle className="text-teal-500" size={20} />;
      case 'Rejected': return <XCircle className="text-red-500" size={20} />;
      default: return <Clock className="text-slate-400" size={20} />;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'In Review': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'Interview': return 'bg-teal-50 border-teal-200 text-teal-700';
      case 'Rejected': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getTabStyle = (status) => {
    const isActive = activeStatus === status;
    if (!isActive) return 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50';
    switch (status) {
      case 'All': return 'border border-slate-800 bg-slate-800 text-white';
      case 'In Review': return 'border border-yellow-400 bg-yellow-50 text-yellow-700';
      case 'Interview': return 'border border-teal-400 bg-teal-50 text-teal-700';
      case 'Rejected': return 'border border-red-400 bg-red-50 text-red-700';
      default: return 'border border-slate-200 bg-white text-slate-600';
    }
  };

  const filtered = applications.filter(app => {
    const matchesSearch =
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeStatus === 'All' || app.status === activeStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-500 mt-2">Track the status of your submitted job applications.</p>
        </div>
        <div className="text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-full">
          {filtered.length} / {applications.length} shown
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(status => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${getTabStyle(status)}`}
            >
              {status}
              {status !== 'All' && (
                <span className="ml-1.5 opacity-60 text-xs">
                  ({applications.filter(a => a.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {filtered.map((app) => (
            <li key={app.id} className="hover:bg-slate-50 transition-colors group">
              <Link to={`/applications/${app.id}`} className="flex items-center justify-between p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full">
                  <div className="flex-grow">
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{app.jobTitle}</h2>
                    <div className="flex items-center gap-3 text-slate-500 text-sm mt-1">
                      <span className="flex items-center gap-1"><Building size={16} /> {app.company}</span>
                      <span className="text-slate-300">•</span>
                      <span>Applied on {app.date}</span>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold whitespace-nowrap w-fit ${getStatusBg(app.status)}`}>
                    {getStatusIcon(app.status)}
                    {app.status}
                  </div>
                </div>

                <div className="ml-6 hidden sm:block text-slate-400 group-hover:text-teal-500 transition-colors">
                  <ChevronRight size={24} />
                </div>
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-12 text-center text-slate-500">
              {applications.length === 0
                ? "You haven't applied to any jobs yet."
                : "No applications match your filters."}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
