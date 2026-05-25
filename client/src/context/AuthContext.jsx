import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Create base axios instance
export const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Request interceptor to automatically add JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    // Check if user is logged in on load
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Auto login failed', err.message);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check credentials.' 
      };
    }
  };

  const register = async (username, email, password, avatar, bio) => {
    try {
      const res = await api.post('/auth/register', { username, email, password, avatar, bio });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (bio, avatar) => {
    if (!user) return { success: false, message: 'Not logged in' };
    try {
      const res = await api.put(`/users/${user._id}`, { bio, avatar });
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed.' 
      };
    }
  };

  const toggleSavePost = (postId, shouldSave) => {
    if (!user) return;
    setUser(prev => {
      let updatedSaved = [...(prev.savedPosts || [])];
      if (shouldSave) {
        if (!updatedSaved.includes(postId)) updatedSaved.push(postId);
      } else {
        updatedSaved = updatedSaved.filter(id => id !== postId);
      }
      return { ...prev, savedPosts: updatedSaved };
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      toggleSavePost,
      darkMode,
      setDarkMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};
