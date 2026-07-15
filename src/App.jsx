import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ToastProvider } from './context/ToastContext';

// Lazy-load all pages
const AuthLanding = lazy(() => import('./pages/AuthLanding'));
const CandidatePortal = lazy(() => import('./pages/CandidatePortal'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const CandidateProfile = lazy(() => import('./pages/CandidateProfile'));
const ApplicationTracker = lazy(() => import('./pages/ApplicationTracker'));
const ApplicationDetails = lazy(() => import('./pages/ApplicationDetails'));
const ManagerPortal = lazy(() => import('./pages/ManagerPortal'));
const JobEditor = lazy(() => import('./pages/JobEditor'));

// Route protection wrappers
const CandidateRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('auth_role');
  if (!token || role !== 'candidate') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const ManagerRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('auth_role');
  if (!token || role !== 'manager') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('auth_role');
  if (token) {
    return <Navigate to={role === 'manager' ? '/manager' : '/jobs'} replace />;
  }
  return children;
};

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>}>
              <Routes>
                {/* Landing page / Login */}
                <Route path="/" element={<PublicRoute><AuthLanding /></PublicRoute>} />
                
                {/* Candidate Portal Routes */}
                <Route path="/jobs" element={<CandidateRoute><CandidatePortal /></CandidateRoute>} />
                <Route path="/jobs/:id" element={<CandidateRoute><JobDetails /></CandidateRoute>} />
                <Route path="/profile" element={<CandidateRoute><CandidateProfile /></CandidateRoute>} />
                <Route path="/applications" element={<CandidateRoute><ApplicationTracker /></CandidateRoute>} />
                <Route path="/applications/:id" element={<CandidateRoute><ApplicationDetails /></CandidateRoute>} />
                
                {/* Manager Portal Routes */}
                <Route path="/manager" element={<ManagerRoute><ManagerPortal /></ManagerRoute>} />
                <Route path="/manager/jobs/new" element={<ManagerRoute><JobEditor /></ManagerRoute>} />
                <Route path="/manager/jobs/edit/:id" element={<ManagerRoute><JobEditor /></ManagerRoute>} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
