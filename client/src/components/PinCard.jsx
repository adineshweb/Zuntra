import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowUpRight, Download, Bookmark } from 'lucide-react';
import { AuthContext, api } from '../context/AuthContext';

const PinCard = ({ post, onLikeUpdate }) => {
  const navigate = useNavigate();
  const { user, toggleSavePost } = useContext(AuthContext);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isSaved = user?.savedPosts?.includes(post._id);

  const handleCardClick = () => {
    navigate(`/post/${post._id}`);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (isLiking) return;

    try {
      setIsLiking(true);
      const res = await api.post(`/posts/${post._id}/like`);
      if (res.data.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likes.length);
        if (onLikeUpdate) onLikeUpdate(post._id, res.data.likes);
      }
    } catch (err) {
      console.error('Error liking post:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (isSaving) return;

    try {
      setIsSaving(true);
      const res = await api.post(`/posts/${post._id}/save`);
      if (res.data.success) {
        toggleSavePost(post._id, res.data.isSaved);
      }
    } catch (err) {
      console.error('Error saving post:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    // Fetch image as blob to download cleanly
    fetch(post.image)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${post.title.replace(/\s+/g, '_') || 'zuntra_pin'}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => console.error('Error downloading image:', err));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group mb-5 break-inside-avoid flex flex-col cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Visual Container */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 shadow-sm transition-shadow duration-300 hover:shadow-md">
        {/* Skeleton while image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-2xl min-h-[200px]"></div>
        )}

        <img 
          src={post.image} 
          alt={post.title}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-auto object-cover max-h-[500px] transition-transform duration-500 ease-out group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Hover Overlay - Desktop only */}
        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 hidden md:flex flex-col justify-between p-3 z-10">
          {/* Top Actions */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs text-white font-medium">
              <span className="truncate max-w-[100px]">{post.category}</span>
            </div>
            <button
              onClick={handleSave}
              className={`rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-colors duration-200 ${
                isSaved 
                  ? 'bg-zinc-800 text-white hover:bg-zinc-950' 
                  : 'bg-zuntra-red text-white hover:bg-red-700'
              }`}
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between w-full">
            <div 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/user/${post.userId?._id}`);
              }}
              className="flex items-center space-x-2 text-white hover:underline truncate max-w-[140px]"
            >
              <img 
                src={post.userId?.avatar} 
                alt={post.userId?.username} 
                className="w-7 h-7 rounded-full object-cover border border-white/20"
              />
              <span className="text-xs font-semibold truncate">{post.userId?.username}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={handleLike}
                className="p-2 bg-white/90 hover:bg-white text-zinc-900 rounded-full transition-transform duration-100 active:scale-90 shadow-sm"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-zuntra-red text-zuntra-red' : ''}`} />
              </button>
              <button 
                onClick={handleDownload}
                className="p-2 bg-white/90 hover:bg-white text-zinc-900 rounded-full transition-transform duration-100 active:scale-90 shadow-sm"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile view details (always visible beneath the card) */}
      <div className="mt-2 px-1 flex md:hidden flex-col">
        <h3 className="text-xs font-semibold truncate leading-tight dark:text-zinc-200">{post.title}</h3>
        <div className="mt-1 flex items-center justify-between">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/user/${post.userId?._id}`);
            }}
            className="flex items-center space-x-1"
          >
            <img 
              src={post.userId?.avatar} 
              alt={post.userId?.username} 
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium truncate max-w-[80px]">
              {post.userId?.username}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={handleLike}
              className="flex items-center space-x-0.5 text-zinc-500 dark:text-zinc-400"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-zuntra-red text-zuntra-red' : ''}`} />
              <span className="text-[10px]">{likesCount}</span>
            </button>
            <button 
              onClick={handleSave}
              className={`p-1 rounded-full ${isSaved ? 'text-zuntra-red' : 'text-zinc-400'}`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Title only for desktop, since creator details are on hover */}
      <h3 className="hidden md:block mt-2 text-sm font-semibold truncate px-1 dark:text-zinc-200 leading-tight">
        {post.title}
      </h3>
    </motion.div>
  );
};

export default PinCard;
