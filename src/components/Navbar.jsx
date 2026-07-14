import { Link, useLocation } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isManager = location.pathname.startsWith('/manager');

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to={isManager ? '/manager' : '/jobs'} className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                <Briefcase size={20} />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">Matchr<span className="text-primary-600">.ai</span></span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {!isManager ? (
              <>
                <Link to="/jobs" className="text-slate-600 hover:text-primary-600 font-medium px-3 py-2 rounded-md transition-colors">Jobs</Link>
                <Link to="/applications" className="text-slate-600 hover:text-primary-600 font-medium px-3 py-2 rounded-md transition-colors">My Applications</Link>
                <Link to="/profile" className="text-slate-600 hover:text-primary-600 font-medium px-3 py-2 rounded-md transition-colors">My Profile</Link>
                <Link to="/manager" className="text-slate-500 hover:text-slate-900 text-sm px-3 py-2">Manager Login</Link>
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Sign In
                </button>
              </>
            ) : (
              <>
                <Link to="/manager" className="text-slate-600 hover:text-primary-600 font-medium px-3 py-2 rounded-md transition-colors">Dashboard</Link>
                <Link to="/jobs" className="text-slate-500 hover:text-slate-900 text-sm px-3 py-2">View Candidate Portal</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
