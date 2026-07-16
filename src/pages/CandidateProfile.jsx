import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { saveProfile, getProfile } from '../lib/storage';
import { useToast } from '../context/ToastContext';
import { organizeResumeText } from '../lib/aiService';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set up pdf.js worker using Vite asset URL
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function CandidateProfile() {
  const { showToast } = useToast();
  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [isExtractionSuccessful, setIsExtractionSuccessful] = useState(false);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    title: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      const saved = await getProfile();
      if (saved) {
        setProfile({
          name: saved.name || '',
          email: saved.email || '',
          title: saved.title || ''
        });
        if (saved.extractedText) {
          setExtractedText(saved.extractedText);
          setIsExtractionSuccessful(true);
        }
        if (saved.fileName) setFile({ name: saved.fileName }); // mock file object just for UI
      }
    };
    loadProfile();
  }, []);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsing(true);
    setExtractedText('');
    setIsExtractionSuccessful(false);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
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

      setIsParsing(false);
      setIsOrganizing(true);

      try {
        const organized = await organizeResumeText(fullText);
        setExtractedText(organized);
        setIsExtractionSuccessful(true);
        showToast('Resume text successfully extracted and organized by AI!', 'success');
      } catch (aiErr) {
        console.error('AI Organize error, falling back to raw text:', aiErr);
        setExtractedText(fullText);
        setIsExtractionSuccessful(true);
        showToast('Extracted text successfully, but AI organization failed. Using raw text.', 'warning');
      } finally {
        setIsOrganizing(false);
      }
    } catch (error) {
      console.error('Error parsing PDF:', error);
      showToast(error.message || 'Failed to parse PDF. Please check the file or paste the text manually.', 'error');
      setIsExtractionSuccessful(false);
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveProfile({
        ...profile,
        extractedText,
        fileName: file ? file.name : null
      }, file);
      showToast('Profile saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'An error occurred while saving your profile.', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input 
                type="email" 
                value={profile.email}
                onChange={e => setProfile({...profile, email: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="jane@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Professional Title</label>
              <input 
                type="text" 
                value={profile.title}
                onChange={e => setProfile({...profile, title: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Resume Upload</h2>
          
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${file ? 'border-primary-400 bg-primary-50' : 'border-slate-300 hover:border-primary-300 hover:bg-slate-50'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf" 
              className="hidden" 
            />
            
            {isParsing ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-primary-700 font-medium">Extracting text from PDF...</p>
              </div>
            ) : isOrganizing ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mb-4 animate-pulse"></div>
                <p className="text-teal-700 font-medium animate-pulse">AI is organizing your resume layout...</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center text-primary-700">
                <CheckCircle size={40} className="mb-3 text-primary-500" />
                <p className="font-semibold text-lg">{file.name}</p>
                <p className="text-sm mt-1 text-primary-600/80">Click to upload a different file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-500">
                <Upload size={40} className="mb-3 text-slate-400" />
                <p className="font-semibold text-lg text-slate-700">Click to upload your resume (PDF)</p>
                <p className="text-sm mt-1">Our AI will automatically extract your skills and experience.</p>
              </div>
            )}
          </div>

          {isExtractionSuccessful && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-emerald-800 text-sm">Resume successfully extracted!</h4>
                <p className="text-emerald-700 text-xs mt-1">We found readable text in your PDF. Please review and refine the text below to make sure it includes all your skills, projects, and work experience before saving.</p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700">Review & Edit Resume Text</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {extractedText.length} characters
              </span>
            </div>
            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Paste your resume text here manually if the PDF parsing did not work..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 h-64 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all whitespace-pre-wrap"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
