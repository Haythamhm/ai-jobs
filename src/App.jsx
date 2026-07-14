import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';

// Lazy-load all pages so a crash in one doesn't break the whole app
const CandidatePortal = lazy(() => import('./pages/CandidatePortal'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const CandidateProfile = lazy(() => import('./pages/CandidateProfile'));
const ApplicationTracker = lazy(() => import('./pages/ApplicationTracker'));
const ApplicationDetails = lazy(() => import('./pages/ApplicationDetails'));
const ManagerPortal = lazy(() => import('./pages/ManagerPortal'));
const JobEditor = lazy(() => import('./pages/JobEditor'));

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/jobs" replace />} />
              <Route path="/jobs" element={<CandidatePortal />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/profile" element={<CandidateProfile />} />
              <Route path="/applications" element={<ApplicationTracker />} />
              <Route path="/applications/:id" element={<ApplicationDetails />} />
              <Route path="/manager" element={<ManagerPortal />} />
              <Route path="/manager/jobs/new" element={<JobEditor />} />
              <Route path="/manager/jobs/edit/:id" element={<JobEditor />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
