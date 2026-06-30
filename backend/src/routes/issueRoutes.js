const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssues,
  getIssueById,
  addEvidence,
  checkDuplicate,
  getAddressSuggestions,
  getPlaceDetails
} = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getIssues);
router.get('/id/:id', getIssueById);

// Protected routes
router.get('/check-duplicate', protect, checkDuplicate);
router.get('/address-suggestions', protect, getAddressSuggestions);
router.get('/place-details', protect, getPlaceDetails);
router.post('/', protect, upload.single('media'), createIssue);
router.post('/:id/evidence', protect, upload.single('media'), addEvidence);

module.exports = router;
