import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building, DollarSign, Clock, FileText, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { getJobById, addApplication, getProfile, saveProfile } from '../lib/storage';
import { useToast } from '../context/ToastContext';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function JobDetails() {
  const { showToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedNewText, setExtractedNewText] = useState('');
  const [extractionSuccess, setExtractionSuccess] = useState(false);

  useEffect(() => {
    const loadJobAndProfile = async () => {
      const foundJob = await getJobById(id);
      if (foundJob) {
        setJob(foundJob);
      } else {
        navigate('/jobs');
      }
      
      const foundProfile = await getProfile();
      setProfile(foundProfile);
    };
    loadJobAndProfile();
  }, [id, navigate]);

  const handleApplyClick = () => {
    // If the candidate profile has no details or is empty
    if (!profile || (!profile.title && !profile.extractedText)) {
      showToast('Please complete your profile and upload a resume before applying.', 'error');
      navigate('/profile');
      return;
    }
    setNewFile(null);
    setExtractedNewText('');
    setExtractionSuccess(false);
    setIsModalOpen(true);
  };

  const handleModalFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setNewFile(selectedFile);
    setIsExtracting(true);
    setExtractedNewText('');
    setExtractionSuccess(false);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      if (fullText.trim().length === 0) {
        throw new Error("No text content found in the PDF. It might be scanned or empty.");
      }

      setExtractedNewText(fullText);
      setExtractionSuccess(true);
      showToast('Resume text extracted successfully! Please review it below.', 'success');
    } catch (error) {
      console.error('Error parsing PDF:', error);
      showToast(error.message || 'Failed to parse PDF. Please check the file or paste the text manually.', 'error');
      setExtractionSuccess(false);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplySubmit = async (isNew) => {
    setIsApplying(true);
    try {
      if (isNew && !newFile) {
        showToast('Please select a PDF file to upload.', 'error');
        setIsApplying(false);
        return;
      }

      let resumeTextForApp = '';

      if (isNew) {
        resumeTextForApp = extractedNewText;
      } else {
        // Snapshot the current profile's text if using the saved resume
        resumeTextForApp = profile.extractedText || profile.rawResumeText || '';
      }

      const success = await addApplication(job, isNew ? newFile : null, resumeTextForApp);
      if (success) {
        showToast('Application submitted successfully!', 'success');
        setIsModalOpen(false);
        setNewFile(null);
        setExtractedNewText('');
        setExtractionSuccess(false);
        navigate('/applications');
      } else {
        showToast('You have already applied for this job.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'An error occurred while submitting your application.', 'error');
    } finally {
      setIsApplying(false);
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
              onClick={handleApplyClick}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-950">Submit Application</h2>
              <button 
                onClick={() => { setIsModalOpen(false); setNewFile(null); }}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Option 1: Existing CV */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/20 transition-all cursor-pointer group">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-primary-50 text-primary-600 group-hover:bg-primary-100 transition-all">
                    <FileText size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-slate-900">Use Saved Resume</h3>
                    {profile && profile.fileName ? (
                      <p className="text-sm text-slate-500 mt-0.5">{profile.fileName}</p>
                    ) : (
                      <p className="text-sm text-amber-600 mt-0.5">No resume found in your profile</p>
                    )}
                  </div>
                </div>
                <button
                  disabled={isApplying || !profile || !profile.fileName}
                  onClick={() => handleApplySubmit(false)}
                  className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white disabled:bg-slate-200 disabled:text-slate-400 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Apply with Saved Resume
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase">Or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Option 2: Upload New CV */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/20 transition-all group">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-all">
                    <Upload size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Upload New Resume</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Attach a unique PDF resume for this job</p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleModalFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {isExtracting ? (
                    <div className="flex items-center justify-center space-x-2 text-primary-600 text-xs font-semibold">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      <span>Extracting resume text...</span>
                    </div>
                  ) : newFile ? (
                    <div className="text-slate-800 text-sm font-medium flex items-center justify-center space-x-1.5">
                      <FileText size={16} className="text-emerald-600" />
                      <span>{newFile.name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-xs">Click or drag PDF here</span>
                  )}
                </div>

                {extractionSuccess && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-2">
                    <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                    <div className="text-left">
                      <h4 className="font-semibold text-emerald-800 text-xs">Resume successfully extracted!</h4>
                      <p className="text-emerald-700 text-[10px] mt-0.5 leading-tight">Please review the text below to make sure it includes all your skills before applying.</p>
                    </div>
                  </div>
                )}

                {(extractedNewText.length > 0 || newFile) && (
                  <div className="mt-4 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-700">Review & Edit Extracted Text</label>
                      <span className="text-[10px] text-slate-400 font-mono">{extractedNewText.length} chars</span>
                    </div>
                    <textarea
                      value={extractedNewText}
                      onChange={(e) => setExtractedNewText(e.target.value)}
                      placeholder="Or paste/edit your resume text manually here..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 h-36 text-xs font-mono text-slate-600 outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent transition-all whitespace-pre-wrap"
                    />
                  </div>
                )}

                <button
                  disabled={isApplying || isExtracting || !newFile}
                  onClick={() => handleApplySubmit(true)}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-200 disabled:text-slate-400 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Upload & Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
