import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addJob, updateJob, getJobById } from '../lib/storage';

export default function JobEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [job, setJob] = useState({
    title: '',
    company: 'TechCorp',
    location: '',
    salary: '',
    type: 'Full-time',
    description: '',
    requirements: ['']
  });

  useEffect(() => {
    if (isEditMode) {
      const existingJob = getJobById(id);
      if (existingJob) {
        setJob({ ...existingJob, requirements: existingJob.requirements?.length > 0 ? existingJob.requirements : [''] });
      } else {
        navigate('/manager');
      }
    }
  }, [id, isEditMode, navigate]);

  const handleAddRequirement = () => {
    setJob({ ...job, requirements: [...job.requirements, ''] });
  };

  const handleRemoveRequirement = (index) => {
    const newReqs = job.requirements.filter((_, i) => i !== index);
    setJob({ ...job, requirements: newReqs });
  };

  const handleRequirementChange = (text, index) => {
    const newReqs = [...job.requirements];
    newReqs[index] = text;
    setJob({ ...job, requirements: newReqs });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!job.title || !job.description) {
      alert('Please fill out the title and description.');
      return;
    }
    
    if (isEditMode) {
      updateJob(id, job);
      alert('Job updated successfully!');
    } else {
      addJob(job);
      alert('Job published successfully!');
    }
    
    navigate('/manager');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/manager" className="inline-flex items-center text-slate-500 hover:text-primary-600 transition-colors mb-6">
        <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">{isEditMode ? 'Edit Job Offer' : 'Create New Job Offer'}</h1>
          <button 
            onClick={handleSubmit}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md flex items-center gap-2"
          >
            <Save size={18} /> {isEditMode ? 'Save Changes' : 'Publish Job'}
          </button>
        </div>

        <form className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Job Title</label>
              <input 
                type="text" 
                value={job.title}
                onChange={e => setJob({...job, title: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
              <input 
                type="text" 
                value={job.location}
                onChange={e => setJob({...job, location: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="e.g. Remote, or New York, NY"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Salary Range</label>
              <input 
                type="text" 
                value={job.salary}
                onChange={e => setJob({...job, salary: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="e.g. $120k - $150k"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Job Type</label>
              <select 
                value={job.type}
                onChange={e => setJob({...job, type: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Freelance</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Job Description</label>
              <textarea 
                value={job.description}
                onChange={e => setJob({...job, description: e.target.value})}
                rows={5}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="Describe the role and responsibilities..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Required Skills / Requirements</label>
              <p className="text-sm text-slate-500 mb-3">These will be used by the AI to calculate the candidate compatibility score.</p>
              
              <div className="space-y-3">
                {job.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <input 
                      type="text" 
                      value={req}
                      onChange={e => handleRequirementChange(e.target.value, index)}
                      className="flex-grow px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="e.g. 5+ years of React experience"
                    />
                    <button 
                      type="button"
                      onClick={() => handleRemoveRequirement(index)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
              
              <button 
                type="button"
                onClick={handleAddRequirement}
                className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                <Plus size={16} /> Add Requirement
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
