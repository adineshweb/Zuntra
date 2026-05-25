import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { Compass } from 'lucide-react';
import { api } from '../context/AuthContext';
import MasonryGrid from '../components/MasonryGrid';
import { MasonrySkeleton } from '../components/SkeletonLoader';

const CATEGORIES = ['All', 'Nature', 'Design', 'Travel', 'Art', 'Food', 'Photography'];

const Home = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All');
  const [error, setError] = useState(null);

  const loaderRef = useRef(null);
  const categoriesRef = useRef(null);
  const gridContainerRef = useRef(null);

  // Parse category or search reset
  useEffect(() => {
    // Reset state when category or search changes
    setPosts([]);
    setPage(1);
    setLoading(true);
    fetchPosts(1, activeCategory, searchQuery, true);
  }, [activeCategory, searchQuery]);

  // Entrance GSAP animation for categories
  useEffect(() => {
    if (categoriesRef.current) {
      const items = categoriesRef.current.children;
      gsap.fromTo(
        items,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, []);

  const fetchPosts = async (pageNum, category, search, isInitial = false) => {
    try {
      if (!isInitial) setLoadingMore(true);
      setError(null);

      const params = {
        page: pageNum,
        limit: 12,
        category: category !== 'All' ? category : undefined,
        search: search || undefined
      };

      const res = await api.get('/posts', { params });
      
      if (res.data.success) {
        setPosts((prev) => (isInitial ? res.data.posts : [...prev, ...res.data.posts]));
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Could not load posts. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // IntersectionObserver for Infinite Scroll
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage, activeCategory, searchQuery);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loading, page, totalPages, loadingMore, activeCategory, searchQuery]);

  const handleLikeUpdate = (postId, newLikes) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === postId ? { ...post, likes: newLikes } : post))
    );
  };

  return (
    <div className="w-full max-w-8xl mx-auto px-4 py-6 transition-colors duration-300">
      {/* Search Header Banner */}
      {searchQuery && (
        <div className="mb-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Search results for</p>
          <h2 className="text-2xl font-bold dark:text-white">"{searchQuery}"</h2>
        </div>
      )}

      {/* Category Tabs list */}
      <div 
        ref={categoriesRef}
        className="flex items-center space-x-2.5 overflow-x-auto pb-4 mb-6 scrollbar-hide select-none"
      >
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
              activeCategory === category
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Primary Grid Feed */}
      {error ? (
        <div className="text-center py-20">
          <p className="text-red-500 font-semibold">{error}</p>
          <button 
            onClick={() => fetchPosts(1, activeCategory, searchQuery, true)}
            className="mt-4 px-5 py-2.5 bg-zinc-900 text-white rounded-full font-medium"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <MasonrySkeleton />
      ) : (
        <div ref={gridContainerRef}>
          <MasonryGrid posts={posts} onLikeUpdate={handleLikeUpdate} />
        </div>
      )}

      {/* Bottom Intersection Anchor for Infinite Scroll */}
      <div ref={loaderRef} className="w-full py-8 flex justify-center">
        {loadingMore && (
          <div className="flex flex-col items-center space-y-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zuntra-red"></div>
            <p className="text-xs text-zinc-400">Discovering more inspiration...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
