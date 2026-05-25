const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

// @desc    Like or Unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userId = req.user.id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike post
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      // Like post
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      likes: post.likes,
      isLiked: !isLiked
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save or Unsave a post
// @route   POST /api/posts/:id/save
// @access  Private
exports.savePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const user = await User.findById(req.user.id);
    const isSaved = user.savedPosts.includes(post._id);

    if (isSaved) {
      // Unsave post
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== post._id.toString());
    } else {
      // Save post
      user.savedPosts.push(post._id);
    }

    await user.save();

    res.json({
      success: true,
      savedPosts: user.savedPosts,
      isSaved: !isSaved
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = await Comment.create({
      userId: req.user.id,
      postId: post._id,
      text
    });

    // Populate user info for immediate response update
    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'username avatar');

    res.status(201).json({
      success: true,
      comment: populatedComment
    });
  } catch (error) {
    next(error);
  }
};
