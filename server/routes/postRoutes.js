const express = require('express');
const router = express.Router();
const { 
  createPost, 
  getPosts, 
  getPostById, 
  updatePost, 
  deletePost 
} = require('../controllers/postController');
const { 
  likePost, 
  savePost, 
  addComment 
} = require('../controllers/interactionController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Post feed and creation
router.route('/')
  .get(getPosts)
  .post(protect, upload.single('image'), createPost);

// Single post operations
router.route('/:id')
  .get(getPostById)
  .put(protect, upload.single('image'), updatePost)
  .delete(protect, deletePost);

// Post interactions
router.post('/:id/like', protect, likePost);
router.post('/:id/save', protect, savePost);
router.post('/:id/comment', protect, addComment);

module.exports = router;
