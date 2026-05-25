const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { getImageUrl } = require('../config/cloudinary');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { title, description, category, tags } = req.body;
    
    const imageUrl = getImageUrl(req);
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image for the post'
      });
    }

    // Process tags (comma-separated string or array)
    let processedTags = [];
    if (tags) {
      processedTags = Array.isArray(tags) 
        ? tags 
        : tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    }

    const post = await Post.create({
      title,
      description,
      category,
      tags: processedTags,
      image: imageUrl,
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts (with search, category filter, and infinite scroll pagination)
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by Category
    if (req.query.category && req.query.category !== 'All') {
      query.category = { $regex: new RegExp('^' + req.query.category + '$', 'i') };
    }

    // Search Query (matches title, description, or tags)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    const posts = await Post.find(query)
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      count: posts.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'username avatar bio followers');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Retrieve comments manually and populate user info
    const comments = await Comment.find({ postId: post._id })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      post,
      comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Make sure user is post owner
    if (post.userId.toString() !== req.user.id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const { title, description, category, tags } = req.body;
    
    // Process tags
    let processedTags = post.tags;
    if (tags) {
      processedTags = Array.isArray(tags)
        ? tags
        : tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    }

    const updateFields = {
      title: title || post.title,
      description: description || post.description,
      category: category || post.category,
      tags: processedTags
    };

    // If file uploaded, update image
    const newImageUrl = getImageUrl(req);
    if (newImageUrl) {
      updateFields.image = newImageUrl;
    }

    post = await Post.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Make sure user is post owner
    if (post.userId.toString() !== req.user.id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Delete post comments
    await Comment.deleteMany({ postId: post._id });

    // Remove post reference from any users who saved it
    await require('../models/User').updateMany(
      { savedPosts: post._id },
      { $pull: { savedPosts: post._id } }
    );

    // Delete post
    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post and its comments deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
