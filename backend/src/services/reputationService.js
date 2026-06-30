const User = require('../models/User');
const Badge = require('../models/Badge');
const Notification = require('../models/Notification');
const Validation = require('../models/Validation');
const Issue = require('../models/Issue');

/**
 * Award points and reputation to a user and check for badges
 * @param {String} userId - User ID
 * @param {Number} points - Points to add
 * @param {Number} reputation - Reputation score change
 * @param {String} reason - Reason for points allocation
 */
exports.awardPoints = async (userId, points, reputation, reason) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.points += points;
    user.reputationScore += reputation;
    await user.save();

    // Create notification
    await Notification.create({
      user: userId,
      title: `Points Awarded!`,
      message: `You earned +${points} points and +${reputation} reputation for: ${reason}`,
      type: 'reputation_bonus'
    });

    // Check for badges
    await this.checkAndAwardBadges(userId);
  } catch (error) {
    console.error('Error awarding points/reputation:', error.message);
  }
};

/**
 * Perform checks for badge qualification and award any newly unlocked badges
 * @param {String} userId - User ID
 */
exports.checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId).populate('badges');
    if (!user) return;

    // Get all badges from database to match criteria
    const badgesInDb = await Badge.find({});
    if (badgesInDb.length === 0) return; // Seed first

    const userBadgeKeys = user.badges.map(b => b.badgeKey);

    const qualifications = [];

    // Qualification check 1: First Reporter
    if (!userBadgeKeys.includes('first_reporter') && user.reportCount >= 1) {
      qualifications.push('first_reporter');
    }

    // Qualification check 2: Community Hero (10 or more reports submitted)
    if (!userBadgeKeys.includes('community_hero') && user.reportCount >= 10) {
      qualifications.push('community_hero');
    }

    // Qualification check 3: Civic Guardian (15 or more validations submitted)
    if (!userBadgeKeys.includes('civic_guardian') && user.validationCount >= 15) {
      qualifications.push('civic_guardian');
    }

    // Qualification check 4: Local Champion (500 or more reputation score)
    if (!userBadgeKeys.includes('local_champion') && user.reputationScore >= 500) {
      qualifications.push('local_champion');
    }

    // Qualification check 5: Truth Seeker (5 or more validations)
    if (!userBadgeKeys.includes('truth_seeker') && user.validationCount >= 5) {
      qualifications.push('truth_seeker');
    }

    // Qualification check 6: Resolution Hero (Has reported or validated 3 or more resolved issues)
    if (!userBadgeKeys.includes('resolution_hero')) {
      const resolvedIssuesCount = await Issue.countDocuments({
        $or: [
          { reporter: userId, status: 'resolved' },
          { _id: { $in: await Validation.find({ user: userId, type: 'resolve_vote' }).distinct('issue') } }
        ]
      });
      if (resolvedIssuesCount >= 3) {
        qualifications.push('resolution_hero');
      }
    }

    // If new qualifications are found, save them
    if (qualifications.length > 0) {
      for (const key of qualifications) {
        const badgeObj = badgesInDb.find(b => b.badgeKey === key);
        if (badgeObj) {
          user.badges.push(badgeObj._id);
          
          // Notify user
          await Notification.create({
            user: userId,
            title: `Badge Unlocked: ${badgeObj.name}!`,
            message: `Congratulations! You unlocked the '${badgeObj.name}' badge: ${badgeObj.description}`,
            type: 'badge_earned'
          });
          
          console.log(`User ${user.name} unlocked badge: ${badgeObj.name}`);
        }
      }
      await user.save();
    }
  } catch (error) {
    console.error('Error verifying badges eligibility:', error.message);
  }
};
