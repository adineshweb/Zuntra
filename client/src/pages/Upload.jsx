import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Trash2, Tag, Layers, FileText, ChevronRight } from 'lucide-react';
import { AuthContext, api } from '../context/AuthContext';

const CATEGORIES = ['Nature', 'Design', 'Travel', 'Art', 'Food', 'Photography'];

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Nature');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    } else {
      setError('Please upload a valid image file (PNG, JPG, WEBP).');
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleResetImage = (e) => {
    e.stopPropagation();
    setImage(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please select or drop an image first.');
      return;
    }
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('tags', tags);
      formData.append('image', image);

      const res = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        // Redirect to user profile
        navigate(`/user/${user._id}`);
      }
    } catch (err) {
      console.error('Error uploading post:', err);
      setError(err.response?.data?.message || 'Server error uploading pin. Try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-6 dark:text-white">Create a Pin</h1>
      
      <form 
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] overflow-hidden p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm transition-colors duration-300"
      >
        {/* Left Side: Upload Dropzone */}
        <div className="w-full md:w-[45%] flex flex-col items-center">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={`w-full min-h-[350px] md:min-h-[450px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 relative group overflow-hidden ${
              imagePreview 
                ? 'border-zinc-200 dark:border-zinc-800' 
                : 'border-zinc-300 hover:border-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-500 bg-zinc-50/50 dark:bg-zinc-950/20'
            }`}
          >
            {imagePreview ? (
              <>
                <img 
                  src={imagePreview} 
                  alt="Upload Preview" 
                  className="w-full h-full max-h-[420px] object-contain rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleResetImage}
                  className="absolute bottom-4 right-4 p-2 bg-zinc-900/90 dark:bg-zinc-800/90 text-white rounded-full hover:bg-zuntra-red transition-colors shadow-md"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center text-center p-6 select-none">
                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 group-hover:scale-105 transition-transform">
                  <UploadIcon className="w-6 h-6" />
                </div>
                <p className="mt-4 text-sm font-semibold dark:text-zinc-300">Choose a file or drag it here</p>
                <p className="mt-2 text-xs text-zinc-400 max-w-[200px] leading-relaxed">
                  We recommend high quality .jpg files under 10MB
                </p>
              </div>
            )}
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Right Side: Details Form inputs */}
        <div className="w-full md:w-[55%] flex flex-col justify-between">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Title</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add your title" 
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell everyone what your Pin is about" 
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:text-white resize-none"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Category</label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:text-white appearance-none cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Tags (comma separated) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tags</label>
              <input 
                type="text" 
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="photography, landscape, warm, retro (separated by commas)" 
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {error && (
              <p className="text-red-500 text-xs font-medium mb-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={uploading}
              className={`w-full py-3.5 rounded-full font-bold text-sm tracking-wide text-white transition-all ${
                uploading 
                  ? 'bg-zinc-400 cursor-not-allowed' 
                  : 'bg-zuntra-red hover:bg-red-700 active:scale-[0.98]'
              }`}
            >
              {uploading ? 'Publishing your Pin...' : 'Publish'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Upload;
