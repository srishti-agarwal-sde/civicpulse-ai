const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String, // Icon name or key (e.g. 'emoji', 'mdi-icon')
    required: true,
  },
  criteria: {
    type: String, // Description of how to earn it
    required: true,
  },
  badgeKey: {
    type: String, // String identifier like 'first_reporter', 'civic_guardian'
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Badge', BadgeSchema);
