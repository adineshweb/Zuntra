const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile, 
  followUser 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/:id', getUserProfile);
router.put('/:id', protect, updateUserProfile);
router.post('/:id/follow', protect, followUser);

module.exports = router;
