const Issue = require('../models/Issue');
const IssueMedia = require('../models/IssueMedia');
const User = require('../models/User');

// @desc    Get all flagged or unapproved media attachments
// @route   GET /api/admin/flagged-media
// @access  Private/Admin
exports.getFlaggedMedia = async (req, res) => {
  try {
    const flaggedItems = await IssueMedia.find({
      $or: [
        { flagged: true },
        { aiRelevance: 'Unrelated' },
        { isAdminApproved: false }
      ]
    })
      .populate('issue', 'title description category status')
      .populate('uploadedBy', 'name email reputationScore');

    res.json({
      success: true,
      count: flaggedItems.length,
      data: flaggedItems
    });
  } catch (error) {
    console.error('Get flagged media error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject flagged media
// @route   PUT /api/admin/flagged-media/:id
// @access  Private/Admin
exports.reviewMedia = async (req, res) => {
  try {
    const { approve } = req.body; // true = approve, false = reject
    
    if (approve === undefined) {
      return res.status(400).json({ success: false, message: 'Please specify whether to approve or reject' });
    }

    const media = await IssueMedia.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media attachment not found' });
    }

    if (approve) {
      media.flagged = false;
      media.aiRelevance = 'Relevant'; // Override relevance
      media.isAdminApproved = true;
    } else {
      media.flagged = true; // keep flagged so it is hidden in public feeds
      media.isAdminApproved = false;
    }

    await media.save();

    res.json({
      success: true,
      message: approve ? 'Media attachment approved and public' : 'Media attachment rejected and hidden',
      data: media
    });
  } catch (error) {
    console.error('Review media error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Override AI classifications on an issue
// @route   PUT /api/admin/issues/:id/override
// @access  Private/Admin
exports.overrideIssueAI = async (req, res) => {
  try {
    const { category, severityScore, urgencyLevel, impactScore, status } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    if (category) issue.category = category;
    if (severityScore !== undefined) issue.severityScore = parseInt(severityScore);
    if (urgencyLevel) issue.urgencyLevel = urgencyLevel;
    if (impactScore !== undefined) issue.impactScore = parseInt(impactScore);
    if (status) issue.status = status;

    await issue.save();

    res.json({
      success: true,
      message: 'AI classification overridden successfully',
      data: issue
    });
  } catch (error) {
    console.error('Override issue error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (for management console)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).populate('badges').sort({ name: 1 });
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role or reputation details
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUserAdmin = async (req, res) => {
  try {
    const { role, points, reputationScore } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role && ['citizen', 'admin'].includes(role)) {
      user.role = role;
    }
    if (points !== undefined) {
      user.points = parseInt(points);
    }
    if (reputationScore !== undefined) {
      user.reputationScore = parseInt(reputationScore);
    }

    await user.save();

    res.json({
      success: true,
      message: 'User details updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user admin error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
