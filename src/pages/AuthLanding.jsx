import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Mail, Lock, User, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export default function AuthLanding() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate'); // candidate or manager
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isSignUp ? '/auth/register' : '/auth/login';
      const payload = isSignUp
        ? { firstName, lastName, email, password, role, phone }
        : { email, password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Save user session
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_role', data.role);
      localStorage.setItem(
        'auth_user',
        JSON.stringify({
          id: data._id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
        })
      );

      showToast(`Welcome back, ${data.firstName}!`, 'success');
      
      // Redirect to correct dashboard and trigger page refresh to load token headers
      window.location.href = data.role === 'manager' ? '/manager' : '/jobs';
    } catch (err) {
      showToast(err.message || 'An error occurred during authentication.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-stretch bg-slate-900 text-slate-100 overflow-hidden">
      {/* Left Column: Premium Welcome/Intro panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-950 via-slate-950 to-primary-950 items-center justify-center p-12 overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-500 rounded-full blur-[120px] animate-pulse delay-700"></div>
        </div>
        
        <div className="relative z-10 max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <Briefcase size={28} />
            </div>
            <span className="font-extrabold text-3xl tracking-tight text-white">Matchr<span className="text-primary-400">.ai</span></span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              The Intelligent Way to Land Your Next Job.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Matchr.ai connects top talent with managers using smart PDF resume extraction and AI compatibility scoring.
            </p>
          </div>

          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-primary-400 flex-shrink-0" size={20} />
              <span className="text-slate-300 font-medium">Zero-fuss resume parsing & parsing workers</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-primary-400 flex-shrink-0" size={20} />
              <span className="text-slate-300 font-medium">Automatic application date tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-primary-400 flex-shrink-0" size={20} />
              <span className="text-slate-300 font-medium">Real-time status updates & AI analysis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Clean glassmorphic auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white">
              {isSignUp ? 'Create your account' : 'Sign in to Matchr.ai'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isSignUp ? 'Join as a candidate or employer' : 'Enter your credentials to access your dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Jane"
                        className="w-full bg-slate-900/60 border border-slate-800 focus:border-primary-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full bg-slate-900/60 border border-slate-800 focus:border-primary-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">User Role</label>
                  <div className="grid grid-cols-2 gap-3 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setRole('candidate')}
                      className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                        role === 'candidate'
                          ? 'bg-primary-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Candidate
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('manager')}
                      className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                        role === 'manager'
                          ? 'bg-primary-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Manager / Employer
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Contact Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+212 600 000 000"
                      className="w-full bg-slate-900/60 border border-slate-800 focus:border-primary-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@example.com"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-primary-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-primary-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white disabled:bg-slate-800 disabled:text-slate-500 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
