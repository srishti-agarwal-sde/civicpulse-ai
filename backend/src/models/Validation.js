const mongoose = require('mongoose');

const ValidationSchema = new mongoose.Schema({
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['confirm', 'upvote', 'resolve_vote'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Avoid duplicate validation from the same user for the same type on an issue
ValidationSchema.index({ issue: 1, user: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Validation', ValidationSchema);
