import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { KeyRound, Mail, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const cardRef = useRef(null);
  const logoRef = useRef(null);

  // Extract redirect parameter
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    // If user is already logged in, redirect them
    if (user) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath]);

  useEffect(() => {
    // GSAP Entrance Animations
    if (cardRef.current && logoRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(logoRef.current, 
        { scale: 0, rotation: -45, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
      );
      tl.fromTo(cardRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await login(email, password);
      if (res.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('An unexpected login error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-gradient-to-tr from-zinc-50 via-zinc-100 to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      
      {/* Decorative backdrop shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-red-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-zinc-500/10 blur-[100px] pointer-events-none"></div>

      {/* Brand Floating Logo */}
      <div ref={logoRef} className="mb-6 flex flex-col items-center select-none">
        <div className="w-14 h-14 rounded-full bg-zuntra-red flex items-center justify-center text-white font-black text-3xl shadow-lg border-2 border-white dark:border-zinc-800">
          Z
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-tight dark:text-white">Welcome back to Zuntra</h2>
      </div>

      {/* Main Glassmorphic Card */}
      <div 
        ref={cardRef}
        className="w-full max-w-md bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-100 dark:border-zinc-800/80 rounded-3xl shadow-xl p-8 relative z-10 transition-colors duration-300"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Mail className="w-4 h-4" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:text-white"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:text-white"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-1.5 text-zuntra-red text-xs bg-red-50 dark:bg-red-950/20 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-full font-bold text-sm tracking-wide text-white transition-all active:scale-[0.98] ${
              loading 
                ? 'bg-zinc-400 cursor-not-allowed' 
                : 'bg-zuntra-red hover:bg-red-700 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Not on Zuntra yet?{' '}
            <Link to="/register" className="text-zuntra-red hover:underline font-bold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
