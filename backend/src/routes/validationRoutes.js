const express = require('express');
const router = express.Router();
const {
  confirmIssue,
  upvoteIssue,
  resolveIssue,
  addComment,
  getComments
} = require('../controllers/validationController');
const { protect } = require('../middleware/authMiddleware');

// Comments - Public GET
router.get('/:id/comments', getComments);

// Actions - Protected
router.post('/:id/confirm', protect, confirmIssue);
router.post('/:id/upvote', protect, upvoteIssue);
router.post('/:id/resolve', protect, resolveIssue);
router.post('/:id/comments', protect, addComment);

module.exports = router;
