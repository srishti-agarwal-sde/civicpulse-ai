const mongoose = require('mongoose');

const LeaderboardStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  reputationScore: {
    type: Number,
    required: true
  },
  reportCount: {
    type: Number,
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LeaderboardStats', LeaderboardStatsSchema);
