const Issue = require('../models/Issue');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Validation = require('../models/Validation');
const geminiService = require('../services/geminiService');

// @desc    Get Civic Health Dashboard Statistics & AI Insights
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Core issue counts
    const totalIssues = await Issue.countDocuments({});
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    const activeIssues = await Issue.countDocuments({ status: { $ne: 'resolved' } });
    
    // Critical issues are those with urgency 'Critical' or severityScore >= 80
    const criticalIssues = await Issue.countDocuments({
      status: { $ne: 'resolved' },
      $or: [
        { urgencyLevel: 'Critical' },
        { severityScore: { $gte: 80 } }
      ]
    });

    // 2. Community Participation Rates
    const totalComments = await Comment.countDocuments({});
    const totalValidations = await Validation.countDocuments({});
    const participationCount = totalComments + totalValidations;

    // 3. Category Breakdown (Aggregated)
    const categoryStats = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const categoriesFormatted = categoryStats.map(stat => ({
      category: stat._id,
      count: stat.count,
      resolved: stat.resolvedCount,
      active: stat.count - stat.resolvedCount
    }));

    // 4. Top Contributors (By reputation score)
    const topContributors = await User.find({ role: 'citizen' })
      .sort({ reputationScore: -1 })
      .limit(5)
      .select('name reputationScore points badges reportCount validationCount')
      .populate('badges');

    // 5. Calculate Civic Health Score
    // Formula: Base 80
    // + Resolution Rate Weight (up to 20 pts): (resolved / total) * 20
    // - Active Issues Penalty (up to -20 pts): min(activeIssues * 2, 20)
    // - Severity Penalty (up to -20 pts): if active issues: (averageSeverity of active / 100) * 20
    // + Participation Bonus (up to 10 pts): min(participationCount * 0.5, 10)
    
    let baseScore = 75;
    let resolutionBonus = totalIssues > 0 ? (resolvedIssues / totalIssues) * 20 : 20;
    let activePenalty = Math.min(activeIssues * 2, 20);
    
    let severityPenalty = 0;
    if (activeIssues > 0) {
      const activeIssuesList = await Issue.find({ status: { $ne: 'resolved' } });
      const totalSeverity = activeIssuesList.reduce((sum, iss) => sum + (iss.severityScore || 50), 0);
      const avgSeverity = totalSeverity / activeIssues;
      severityPenalty = (avgSeverity / 100) * 15;
    }

    let participationBonus = Math.min(participationCount * 0.5, 10);

    let healthScore = Math.round(baseScore + resolutionBonus - activePenalty - severityPenalty + participationBonus);
    healthScore = Math.max(0, Math.min(100, healthScore)); // Clamp between 0 and 100

    let healthRating = 'Good';
    if (healthScore >= 85) healthRating = 'Excellent';
    else if (healthScore >= 70) healthRating = 'Good';
    else if (healthScore >= 50) healthRating = 'Needs Attention';
    else healthRating = 'Critical';

    // 6. Generate AI Predictive Insights
    // Select a subset of recent active issues to keep Gemini payload light and relevant
    const recentIssues = await Issue.find({ status: { $ne: 'resolved' } })
      .sort({ createdAt: -1 })
      .limit(20);

    const aiInsights = await geminiService.generatePredictiveInsights(recentIssues);

    res.json({
      success: true,
      data: {
        summary: {
          totalIssues,
          activeIssues,
          resolvedIssues,
          criticalIssues,
          participationRate: participationCount,
          civicHealthScore: healthScore,
          civicHealthRating: healthRating
        },
        categories: categoriesFormatted,
        topContributors,
        aiInsights: aiInsights.insights || []
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
