const Validation = require('../models/Validation');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const User = require('../models/User');
const reputationService = require('../services/reputationService');

// @desc    Confirm an issue's existence
// @route   POST /api/validation/:id/confirm
// @access  Private
exports.confirmIssue = async (req, res) => {
  try {
    const issueId = req.params.id;
    const userId = req.user.id;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    if (issue.status === 'resolved') {
      return res.status(400).json({ success: false, message: 'Cannot validate a resolved issue' });
    }

    // Check if validation already exists
    const existing = await Validation.findOne({ issue: issueId, user: userId, type: 'confirm' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already confirmed this issue' });
    }

    // Create confirmation
    await Validation.create({
      issue: issueId,
      user: userId,
      type: 'confirm'
    });

    // Update Issue counts
    issue.confirmations += 1;
    
    // Automatically transition status from 'reported' to 'validated' if confirmations >= 3
    if (issue.status === 'reported' && issue.confirmations >= 3) {
      issue.status = 'validated';
    }
    
    await issue.save();

    // Increment user validations count
    const user = await User.findById(userId);
    user.validationCount += 1;
    await user.save();

    // Award validator points
    await reputationService.awardPoints(userId, 10, 5, 'Confirming a community issue');

    // Award reporter points for a verified issue
    if (issue.reporter.toString() !== userId) {
      await reputationService.awardPoints(issue.reporter, 15, 10, 'Your reported issue has been validated by a community member');
    }

    res.json({
      success: true,
      message: 'Issue confirmed successfully',
      confirmations: issue.confirmations,
      status: issue.status
    });
  } catch (error) {
    console.error('Confirm issue error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upvote an issue to prioritize it
// @route   POST /api/validation/:id/upvote
// @access  Private
exports.upvoteIssue = async (req, res) => {
  try {
    const issueId = req.params.id;
    const userId = req.user.id;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Check if upvote already exists
    const existing = await Validation.findOne({ issue: issueId, user: userId, type: 'upvote' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already upvoted this issue' });
    }

    // Create upvote
    await Validation.create({
      issue: issueId,
      user: userId,
      type: 'upvote'
    });

    issue.upvotes += 1;
    await issue.save();

    // Award points to voter
    await reputationService.awardPoints(userId, 5, 2, 'Upvoting a community issue');

    res.json({
      success: true,
      message: 'Issue upvoted successfully',
      upvotes: issue.upvotes
    });
  } catch (error) {
    console.error('Upvote error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit a resolution vote or resolve issue
// @route   POST /api/validation/:id/resolve
// @access  Private
exports.resolveIssue = async (req, res) => {
  try {
    const issueId = req.params.id;
    const userId = req.user.id;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    if (issue.status === 'resolved') {
      return res.status(400).json({ success: false, message: 'Issue is already resolved' });
    }

    // Admin resolves immediately
    if (req.user.role === 'admin') {
      issue.status = 'resolved';
      await issue.save();

      // Award reporter points for verified resolution
      await reputationService.awardPoints(issue.reporter, 50, 25, 'Your reported issue has been successfully resolved by the city administration');
      
      // Award admin points just as normal gameplay
      await reputationService.awardPoints(userId, 30, 15, 'Successfully resolving a community issue (Admin authority)');

      return res.json({
        success: true,
        message: 'Issue marked as resolved by admin',
        status: issue.status
      });
    }

    // Citizen votes to resolve
    const existing = await Validation.findOne({ issue: issueId, user: userId, type: 'resolve_vote' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already voted this issue as resolved' });
    }

    await Validation.create({
      issue: issueId,
      user: userId,
      type: 'resolve_vote'
    });

    // Check count of resolution votes
    const resolveVotesCount = await Validation.countDocuments({ issue: issueId, type: 'resolve_vote' });

    // If 3 or more citizens vote resolved, mark as resolved
    if (resolveVotesCount >= 3) {
      issue.status = 'resolved';
      await issue.save();

      // Award reporter points for resolution
      await reputationService.awardPoints(issue.reporter, 50, 25, 'Your reported issue has been resolved by community consensus');
      
      // Award resolving voters bonus points
      await reputationService.awardPoints(userId, 30, 15, 'Verifying resolution of a community issue');
    } else {
      await reputationService.awardPoints(userId, 10, 5, 'Casting resolution verification vote');
    }

    res.json({
      success: true,
      message: `Resolution vote submitted. Total resolution votes: ${resolveVotesCount}/3`,
      status: issue.status
    });
  } catch (error) {
    console.error('Resolve issue error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a comment to an issue
// @route   POST /api/validation/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const issueId = req.params.id;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const comment = await Comment.create({
      issue: issueId,
      user: req.user.id,
      text
    });

    // Populate commenter details for UI display
    const populatedComment = await Comment.findById(comment._id).populate('user', 'name reputationScore points role');

    // Award points for helpful contribution
    await reputationService.awardPoints(req.user.id, 5, 2, 'Adding a comment / feedback to an issue report');

    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    console.error('Add comment error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get comments for an issue
// @route   GET /api/validation/:id/comments
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ issue: req.params.id })
      .populate('user', 'name reputationScore points role')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
