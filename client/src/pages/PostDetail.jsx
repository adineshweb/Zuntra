import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ChevronLeft, Send, ArrowUpRight, Download } from 'lucide-react';
import { AuthContext, api } from '../context/AuthContext';
import MasonryGrid from '../components/MasonryGrid';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleSavePost } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState(null);

  // States for Likes/Follows/Saves
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const commentsEndRef = useRef(null);

  const isSaved = user?.savedPosts?.includes(post?._id);

  useEffect(() => {
    fetchPostDetails();
  }, [id]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/posts/${id}`);
      
      if (res.data.success) {
        const postData = res.data.post;
        setPost(postData);
        setComments(res.data.comments || []);
        
        // Setup initial interactive state
        setIsLiked(postData.likes?.includes(user?._id));
        setLikesCount(postData.likes?.length || 0);
        
        const creatorFollowers = postData.userId?.followers || [];
        setIsFollowing(creatorFollowers.includes(user?._id));
        setFollowersCount(creatorFollowers.length);

        // Fetch related posts (same category)
        fetchRelated(postData.category, postData._id);
      }
    } catch (err) {
      console.error('Error fetching post detail:', err);
      setError('Pin not found or database connection error.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async (category, currentPostId) => {
    try {
      const res = await api.get('/posts', {
        params: { category, limit: 6 }
      });
      if (res.data.success) {
        // Filter out current post
        const filtered = res.data.posts.filter(p => p._id !== currentPostId);
        setRelatedPosts(filtered);
      }
    } catch (err) {
      console.error('Error fetching related posts:', err);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }

    try {
      const res = await api.post(`/posts/${post._id}/like`);
      if (res.data.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likes.length);
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigate('/login?redirect=' + window.location.pathname);
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

  const handleFollow = async () => {
    if (!user) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }

    try {
      const res = await api.post(`/users/${post.userId._id}/follow`);
      if (res.data.success) {
        setIsFollowing(res.data.isFollowing);
        setFollowersCount(res.data.followersCount);
      }
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }
    if (!newComment.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      const res = await api.post(`/posts/${post._id}/comment`, { text: newComment });
      if (res.data.success) {
        setComments(prev => [res.data.comment, ...prev]);
        setNewComment('');
        // Scroll comments section to top (latest is prepended)
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDownload = () => {
    fetch(post.image)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${post.title.replace(/\s+/g, '_')}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => console.error('Error downloading:', err));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-zuntra-red"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-red-500">{error || 'Pin not found'}</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-5 py-2 bg-zinc-950 text-white rounded-full">
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 flex items-center space-x-1.5 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 px-3 py-1.5 rounded-full dark:text-zinc-300"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Main card box */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-md flex flex-col md:flex-row border border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
        {/* Left container: Image */}
        <div className="w-full md:w-[55%] bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-auto max-h-[70vh] object-contain rounded-2xl"
          />
        </div>

        {/* Right container: Details */}
        <div className="w-full md:w-[45%] p-6 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800">
          
          <div>
            {/* Action Bar (Top) */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleDownload}
                  className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-700 dark:text-zinc-300 active:scale-95"
                  title="Download Image"
                >
                  <Download className="w-5 h-5" />
                </button>
                <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs px-3 py-1 rounded-full font-medium">
                  {post.category}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-1.5 p-2 px-3.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-sm font-semibold active:scale-95 transition-transform ${
                    isLiked ? 'text-zuntra-red' : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-zuntra-red text-zuntra-red' : ''}`} />
                  <span>{likesCount}</span>
                </button>
                <button 
                  onClick={handleSave}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-full tracking-wide transition-colors ${
                    isSaved 
                      ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900' 
                      : 'bg-zuntra-red text-white hover:bg-red-700'
                  }`}
                >
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            {/* Pin Content */}
            <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight dark:text-white">
              {post.title}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base leading-relaxed mb-6">
              {post.description || 'No description provided.'}
            </p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {post.tags.map((tag) => (
                  <Link 
                    key={tag}
                    to={`/?search=${encodeURIComponent(tag)}`}
                    className="text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full font-medium"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <hr className="border-zinc-100 dark:border-zinc-800 mb-6" />

            {/* Creator details */}
            <div className="flex items-center justify-between mb-6">
              <Link 
                to={`/user/${post.userId._id}`} 
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <img 
                  src={post.userId.avatar} 
                  alt={post.userId.username} 
                  className="w-11 h-11 rounded-full object-cover group-hover:scale-95 transition-transform"
                />
                <div>
                  <h4 className="text-sm font-bold dark:text-white group-hover:underline">@{post.userId.username}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {followersCount} followers
                  </p>
                </div>
              </Link>

              {user?._id !== post.userId._id && (
                <button
                  onClick={handleFollow}
                  className={`px-4 py-2 rounded-full text-xs font-semibold active:scale-95 transition-transform ${
                    isFollowing 
                      ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white' 
                      : 'bg-zinc-900 text-white hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          {/* Comment Section container */}
          <div className="flex-1 flex flex-col justify-end">
            <h3 className="text-sm font-semibold mb-3 dark:text-white">
              Comments ({comments.length})
            </h3>
            
            {/* Comment List */}
            <div className="max-h-48 overflow-y-auto pr-1 mb-4 flex flex-col space-y-3.5 scrollbar-thin">
              {comments.length === 0 ? (
                <p className="text-zinc-400 dark:text-zinc-500 text-xs py-4 italic">No comments yet. Share your thoughts!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="flex items-start space-x-2 text-xs">
                    <Link to={`/user/${comment.userId?._id}`}>
                      <img 
                        src={comment.userId?.avatar} 
                        alt={comment.userId?.username} 
                        className="w-7 h-7 rounded-full object-cover mt-0.5"
                      />
                    </Link>
                    <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl px-3 py-2 flex-1">
                      <span className="font-bold dark:text-white mr-1.5">
                        @{comment.userId?.username || 'anonymous'}
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300">{comment.text}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="relative flex items-center">
              <input 
                type="text" 
                placeholder={user ? "Add a comment..." : "Log in to join the conversation"}
                disabled={!user}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full text-xs bg-zinc-100 dark:bg-zinc-800 border-none rounded-full pl-4 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 dark:text-white disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={!user || !newComment.trim() || submittingComment}
                className="absolute right-2 p-1.5 text-zuntra-red disabled:text-zinc-400 active:scale-90 transition-transform"
              >
                <Send className="w-3.5 h-3.5 fill-current" />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Suggested Pins Section */}
      <div className="mt-14">
        <h2 className="text-lg md:text-xl font-bold mb-6 dark:text-white">More like this</h2>
        {relatedPosts.length === 0 ? (
          <p className="text-zinc-500 text-sm">No related posts found.</p>
        ) : (
          <MasonryGrid posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetail;
