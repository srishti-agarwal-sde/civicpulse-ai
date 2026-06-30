const mongoose = require('mongoose');

const IssueMediaSchema = new mongoose.Schema({
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mediaUrl: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  aiRelevance: {
    type: String,
    enum: ['Relevant', 'Possibly Relevant', 'Unrelated'],
    default: 'Relevant'
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 1.0
  },
  aiExplanation: {
    type: String,
    default: ''
  },
  isAdminApproved: {
    type: Boolean,
    default: null // null = pending, true = approved, false = rejected
  },
  flagged: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('IssueMedia', IssueMediaSchema);
