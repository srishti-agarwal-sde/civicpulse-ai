const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an issue title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add an issue description'],
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Waste Management',
      'Water Leakage',
      'Public Safety',
      'Infrastructure Damage',
      'Accessibility Issues',
      'Environmental Hazards',
      'Street Lighting Issues',
      'Other'
    ],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['reported', 'validated', 'in-progress', 'resolved'],
    default: 'reported'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // AI analysis fields
  severityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  urgencyLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  impactScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  aiSummary: {
    type: String,
    default: ''
  },
  recommendedAction: {
    type: String,
    default: ''
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 1.0
  },
  upvotes: {
    type: Number,
    default: 0
  },
  confirmations: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Set geospatial index for proximity search
IssueSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Issue', IssueSchema);
