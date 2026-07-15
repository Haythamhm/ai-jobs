import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('auth_role');
  const userStr = localStorage.getItem('auth_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_user');
    window.location.href = '/';
  };

  const isManager = role === 'manager';

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm h-16 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={token ? (isManager ? '/manager' : '/jobs') : '/'} className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
                <Briefcase size={18} />
              </div>
              <span className="font-bold text-xl text-slate-950 tracking-tight">Matchr<span className="text-primary-600">.ai</span></span>
            </Link>
          </div>

          {/* Navigation links & User actions */}
          <div className="flex items-center space-x-6">
            {token ? (
              <>
                {/* Dynamic links based on active role */}
                {!isManager ? (
                  <>
                    <Link 
                      to="/jobs" 
                      className={`text-sm font-semibold transition-colors ${
                        location.pathname === '/jobs' ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'
                      }`}
                    >
                      Jobs
                    </Link>
                    <Link 
                      to="/applications" 
                      className={`text-sm font-semibold transition-colors ${
                        location.pathname === '/applications' ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'
                      }`}
                    >
                      My Applications
                    </Link>
                    <Link 
                      to="/profile" 
                      className={`text-sm font-semibold transition-colors ${
                        location.pathname === '/profile' ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'
                      }`}
                    >
                      My Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/manager" 
                      className={`text-sm font-semibold transition-colors ${
                        location.pathname === '/manager' ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'
                      }`}
                    >
                      Dashboard
                    </Link>
                  </>
                )}

                {/* Divider */}
                <span className="h-4 w-px bg-slate-200"></span>

                {/* User info greeting & Logout */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-slate-700 text-sm">
                    <User size={16} className="text-primary-500" />
                    <span className="font-medium hidden sm:inline">Hi, {user?.firstName || 'User'}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors border border-slate-200"
                    title="Sign Out"
                  >
                    <LogOut size={13} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
