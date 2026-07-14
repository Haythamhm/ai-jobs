import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { saveProfile, getProfile } from '../lib/storage';

export default function CandidateProfile() {
  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    title: '',
  });

  useEffect(() => {
    const saved = getProfile();
    if (saved) {
      setProfile({
        name: saved.name || '',
        email: saved.email || '',
        title: saved.title || ''
      });
      if (saved.extractedText) setExtractedText(saved.extractedText);
      if (saved.fileName) setFile({ name: saved.fileName }); // mock file object just for UI
    }
  }, []);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsing(true);
    setExtractedText('');

    try {
      // Set worker source lazily to avoid top-level crash
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      setExtractedText(fullText);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      alert('Failed to parse PDF. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveProfile({
      ...profile,
      extractedText,
      fileName: file ? file.name : null
    });
    alert('Profile saved successfully!');
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

          {extractedText && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700">Extracted AI Data Preview</h3>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-48 overflow-y-auto text-xs font-mono text-slate-600 whitespace-pre-wrap">
                {extractedText}
              </div>
            </div>
          )}
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
