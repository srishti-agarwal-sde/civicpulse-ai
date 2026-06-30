const express = require('express');
const router = express.Router();
const {
  getFlaggedMedia,
  reviewMedia,
  overrideIssueAI,
  getUsers,
  updateUserAdmin
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes with JWT and Admin check
router.use(protect);
router.use(authorize('admin'));

router.get('/flagged-media', getFlaggedMedia);
router.put('/flagged-media/:id', reviewMedia);
router.put('/issues/:id/override', overrideIssueAI);
router.get('/users', getUsers);
router.put('/users/:id', updateUserAdmin);

module.exports = router;
