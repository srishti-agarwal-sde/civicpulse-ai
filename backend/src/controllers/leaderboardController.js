const User = require('../models/User');
const LeaderboardStats = require('../models/LeaderboardStats');

// @desc    Get top user leaderboard rankings
// @route   GET /api/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    // 1. Fetch top citizens sorted by reputation and points
    const topUsers = await User.find({ role: 'citizen' })
      .sort({ reputationScore: -1, points: -1 })
      .limit(50)
      .populate('badges');

    // 2. Map ranks
    const rankings = topUsers.map((user, idx) => ({
      _id: user._id,
      name: user.name,
      reputationScore: user.reputationScore,
      points: user.points,
      reportCount: user.reportCount,
      validationCount: user.validationCount,
      badges: user.badges,
      rank: idx + 1
    }));

    // 3. Perform background cache refresh (asynchronously)
    // Run update sequence in database
    try {
      // Clear current cached stats
      await LeaderboardStats.deleteMany({});
      
      // Bulk insert new leaderboard rankings
      const cacheEntries = rankings.map(item => ({
        user: item._id,
        name: item.name,
        points: item.points,
        reputationScore: item.reputationScore,
        reportCount: item.reportCount,
        rank: item.rank
      }));
      
      if (cacheEntries.length > 0) {
        await LeaderboardStats.insertMany(cacheEntries);
      }
    } catch (cacheErr) {
      console.error('Error refreshing LeaderboardStats cache:', cacheErr.message);
    }

    res.json({
      success: true,
      count: rankings.length,
      data: rankings
    });
  } catch (error) {
    console.error('Get leaderboard error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get cached leaderboard statistics from stats collection (Alternative fast route)
// @route   GET /api/leaderboard/cached
// @access  Public
exports.getCachedLeaderboard = async (req, res) => {
  try {
    const stats = await LeaderboardStats.find({}).sort({ rank: 1 }).populate('user', 'badges');
    res.json({
      success: true,
      count: stats.length,
      data: stats
    });
  } catch (error) {
    console.error('Get cached leaderboard error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
