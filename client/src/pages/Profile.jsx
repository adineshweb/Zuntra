import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, LogOut, Check, X } from 'lucide-react';
import { AuthContext, api } from '../context/AuthContext';
import MasonryGrid from '../components/MasonryGrid';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, logout, updateProfile } = useContext(AuthContext);

  const [profileUser, setProfileUser] = useState(null);
  const [createdPosts, setCreatedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('created'); // 'created' or 'saved'
  const [error, setError] = useState(null);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Edit Profile modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [updating, setUpdating] = useState(false);

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    fetchUserProfile();
  }, [id, currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/users/${id}`);
      
      if (res.data.success) {
        setProfileUser(res.data.user);
        setCreatedPosts(res.data.createdPosts || []);
        setSavedPosts(res.data.savedPosts || []);
        
        // Initial setup for follow stats
        const followers = res.data.user.followers || [];
        setIsFollowing(followers.includes(currentUser?._id));
        setFollowersCount(res.data.user.followersCount || 0);

        setEditBio(res.data.user.bio || '');
        setEditAvatar(res.data.user.avatar || '');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('User profile not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }

    try {
      const res = await api.post(`/users/${id}/follow`);
      if (res.data.success) {
        setIsFollowing(res.data.isFollowing);
        setFollowersCount(res.data.followersCount);
      }
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await updateProfile(editBio, editAvatar);
      if (res.success) {
        setEditModalOpen(false);
        // Refresh local state
        setProfileUser(prev => ({
          ...prev,
          bio: editBio,
          avatar: editAvatar
        }));
      }
    } catch (err) {
      console.error('Update profile error:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-zuntra-red"></div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-red-500">{error || 'Profile not found'}</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-5 py-2 bg-zinc-950 text-white rounded-full">
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header Details */}
      <div className="flex flex-col items-center text-center max-w-lg mx-auto mb-10">
        <div className="relative group">
          <img 
            src={profileUser.avatar} 
            alt={profileUser.username}
            className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-2 border-zinc-100 dark:border-zinc-800 shadow-sm"
          />
          {isOwnProfile && (
            <button 
              onClick={() => setEditModalOpen(true)}
              className="absolute bottom-1 right-1 p-2 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white rounded-full hover:scale-105 shadow-md border border-zinc-100 dark:border-zinc-700 transition-transform active:scale-95"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mt-4 dark:text-white">
          @{profileUser.username}
        </h1>
        
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1.5 font-semibold">
          {followersCount} followers · {profileUser.followingCount} following
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-3 leading-relaxed font-light">
          {profileUser.bio || 'No bio written yet.'}
        </p>

        {/* Action Button Row */}
        <div className="flex items-center space-x-2 mt-6">
          {isOwnProfile ? (
            <>
              <button 
                onClick={() => setEditModalOpen(true)}
                className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-full text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Edit profile
              </button>
              <button 
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zuntra-red rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </>
          ) : (
            <button
              onClick={handleFollow}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-100 active:scale-95 ${
                isFollowing 
                  ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-white hover:bg-zinc-300' 
                  : 'bg-zuntra-red hover:bg-red-700 text-white shadow-sm'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center justify-center border-b border-zinc-100 dark:border-zinc-900 mb-8 select-none">
        <button
          onClick={() => setActiveTab('created')}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-colors relative ${
            activeTab === 'created'
              ? 'border-zinc-900 text-zinc-950 dark:border-white dark:text-white'
              : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'
          }`}
        >
          Created
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-colors relative ${
            activeTab === 'saved'
              ? 'border-zinc-900 text-zinc-950 dark:border-white dark:text-white'
              : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'
          }`}
        >
          Saved
        </button>
      </div>

      {/* Grid Feed Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'created' ? (
            <MasonryGrid posts={createdPosts} />
          ) : (
            <MasonryGrid posts={savedPosts} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Edit Profile Dialog Overlay */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditModalOpen(false)}
          ></div>
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 z-10 border border-zinc-100 dark:border-zinc-800 relative"
          >
            <button 
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-6 dark:text-white">Edit Profile Details</h3>
            
            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Avatar URL</label>
                <input 
                  type="text" 
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Biography</label>
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Introduce yourself..."
                  rows={4}
                  maxLength={160}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-zuntra-red text-white text-xs font-semibold rounded-full active:scale-95 transition-transform"
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;
