import { useState, useEffect } from 'react';
import { Search, MapPin, Building, DollarSign, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getJobs, getProfile } from '../lib/storage';

export default function CandidatePortal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileText, setProfileText] = useState('');

  useEffect(() => {
    const loadData = async () => {
      let allJobs = await getJobs();
      const profile = await getProfile();
      
      if (profile && (profile.title || profile.extractedText)) {
        setHasProfile(true);
        const pText = `${profile.title} ${profile.extractedText}`.toLowerCase();
        setProfileText(pText);
      }
      
      setJobs(allJobs);
    };
    loadData();
  }, []);

  const handleTypeChange = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(job.type);
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Job title, keywords..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Job Type</h3>
            <div className="space-y-2">
              {['Full-time', 'Part-time', 'Contract', 'Freelance'].map(type => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="rounded text-primary-600 focus:ring-primary-500 cursor-pointer" 
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeChange(type)}
                  />
                  <span className="text-slate-600 group-hover:text-slate-900 transition-colors">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Job List */}
        <div className="flex-grow space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              All Jobs
            </h1>
            <span className="text-slate-500 text-sm">Showing {filteredJobs.length} results</span>
          </div>

          {!hasProfile && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex items-center justify-between">
              <span className="text-indigo-800 text-sm font-medium">Complete your profile and upload a resume to get personalized AI job recommendations!</span>
              <Link to="/profile" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ml-4">
                Update Profile
              </Link>
            </div>
          )}

          {filteredJobs.map(job => (
            <Link to={`/jobs/${job.id}`} key={job.id} className="block group">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transform transition-all duration-300 hover:border-primary-300 cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{job.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
                      <span className="flex items-center gap-1"><Building size={16} /> {job.company}</span>
                      <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
                      <span className="flex items-center gap-1"><DollarSign size={16} /> {job.salary}</span>
                      <span className="flex items-center gap-1"><Clock size={16} className="text-slate-400" /> {job.posted}</span>
                    </div>
                  </div>
                  <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {job.type}
                  </span>
                </div>
                <div className="flex gap-2">
                  {job.tags.map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}

          {filteredJobs.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto mt-8 shadow-sm">
              <Search className="mx-auto text-slate-300 mb-4 animate-bounce" size={48} />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No jobs found</h3>
              <p className="text-slate-500 text-sm">We couldn't find any job offers matching your search criteria. Try adjusting your filters or keywords.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
