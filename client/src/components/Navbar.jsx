import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Sun, Moon, LogOut, User, Plus, Compass } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, darkMode, setDarkMode } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleCreateClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate('/login?redirect=/upload');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-900 px-4 py-3 flex items-center justify-between transition-colors duration-300">
      {/* Brand Logo */}
      <div className="flex items-center space-x-2 md:space-x-3">
        <Link to="/" className="flex items-center space-x-1.5 focus:outline-none">
          <div className="w-8 h-8 rounded-full bg-zuntra-red flex items-center justify-center text-white font-extrabold text-lg select-none">
            Z
          </div>
          <span className="hidden sm:block text-lg font-bold tracking-tight text-zuntra-red">
            Zuntra
          </span>
        </Link>

        {/* Main Links */}
        <div className="flex items-center space-x-1">
          <Link 
            to="/" 
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              location.pathname === '/' && !location.search.includes('explore')
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' 
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 dark:text-zinc-300'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/upload" 
            onClick={handleCreateClick}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center space-x-1 ${
              location.pathname === '/upload' 
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' 
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 dark:text-zinc-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Create</span>
          </Link>
        </div>
      </div>

      {/* Global Search Bar */}
      <form 
        onSubmit={handleSearchSubmit} 
        className="flex-1 max-w-xl mx-2 md:mx-6 relative"
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
          <Search className="w-4 h-4" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for photography, design, travel..." 
          className="w-full pl-9 pr-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border-none text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 dark:text-zinc-100"
        />
        {searchQuery && (
          <button 
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-zinc-400 hover:text-zinc-600"
          >
            Clear
          </button>
        )}
      </form>

      {/* Utilities / Auth Action area */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Dark Mode toggle */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full text-zinc-600 dark:text-zinc-300 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {user ? (
          /* Profile area for logged-in user */
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center focus:outline-none"
            >
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 transition-transform active:scale-95"
              />
            </button>

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setDropdownOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-lg py-2 z-20">
                  <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs text-zinc-400">Signed in as</p>
                    <p className="text-sm font-semibold truncate dark:text-zinc-200">@{user.username}</p>
                  </div>
                  <Link 
                    to={`/user/${user._id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full text-left px-4 py-2.5 text-sm text-zuntra-red hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Authentication entry buttons */
          <div className="flex items-center space-x-1.5">
            <Link 
              to="/login"
              className="hidden xs:block px-4 py-2 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 dark:text-zinc-100 rounded-full transition-colors"
            >
              Log in
            </Link>
            <Link 
              to="/register"
              className="px-4 py-2 text-sm font-semibold bg-zuntra-red hover:bg-red-700 text-white rounded-full transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
