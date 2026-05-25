import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { User, Mail, KeyRound, AlertCircle, Edit } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, user } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const cardRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    // GSAP Entrance Animations
    if (cardRef.current && logoRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(logoRef.current, 
        { scale: 0, rotation: 45, opacity: 0 },
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
    if (!username || !email || !password) {
      setError('Please fill in all required fields (username, email, password).');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await register(username.trim(), email.toLowerCase().trim(), password, avatar.trim() || undefined, bio.trim() || undefined);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-gradient-to-tr from-zinc-50 via-zinc-100 to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      
      {/* Background radial shapes */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-red-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-zinc-500/5 blur-[120px] pointer-events-none"></div>

      {/* Brand logo */}
      <div ref={logoRef} className="mb-6 flex flex-col items-center select-none">
        <div className="w-14 h-14 rounded-full bg-zuntra-red flex items-center justify-center text-white font-black text-3xl shadow-lg border-2 border-white dark:border-zinc-800">
          Z
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-tight dark:text-white">Create your Zuntra Account</h2>
      </div>

      {/* Registration card */}
      <div 
        ref={cardRef}
        className="w-full max-w-md bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-100 dark:border-zinc-800/80 rounded-3xl shadow-xl p-8 relative z-10 transition-colors duration-300"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Username *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <User className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="charlie_creative" 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:text-white"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Mail className="w-4 h-4" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="charlie@example.com" 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:text-white"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters" 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:text-white"
              />
            </div>
          </div>

          {/* Avatar URL (optional) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Avatar Image URL (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Edit className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/charlie.png" 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:text-white"
              />
            </div>
          </div>

          {/* Bio (optional) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Biography (Optional)</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..." 
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:text-white resize-none"
            />
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
            className={`w-full py-3 rounded-full font-bold text-sm tracking-wide text-white transition-all active:scale-[0.98] mt-2 ${
              loading 
                ? 'bg-zinc-400 cursor-not-allowed' 
                : 'bg-zuntra-red hover:bg-red-700 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? 'Creating Account...' : 'Sign up'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-zuntra-red hover:underline font-bold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
