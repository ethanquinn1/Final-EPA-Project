const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Interaction = require('../models/Interaction');

// Dashboard overview statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Client statistics
    const totalClients = await Client.countDocuments();
    const clientsByStatus = await Client.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Top clients by engagement score
    const topClients = await Client.find()
      .select('name engagementScore')
      .sort({ engagementScore: -1 })
      .limit(5);

    // Interaction statistics
    const totalInteractions = await Interaction.countDocuments();
    const interactionsByType = await Interaction.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Recent interactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentInteractions = await Interaction.countDocuments({
      date: { $gte: thirtyDaysAgo }
    });

    // Follow-ups due
    const now = new Date();
    const followUpsDue = await Interaction.countDocuments({
      followUpDate: { $lte: now, $ne: null },
      outcome: { $ne: 'completed' }
    });

    // Overdue follow-ups
    const overdueFollowUps = await Interaction.countDocuments({
      followUpDate: { $lt: now },
      outcome: { $ne: 'completed' }
    });

    // Engagement score distribution
    const engagementDistribution = await Client.aggregate([
      {
        $bucket: {
          groupBy: '$engagementScore',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    res.json({
      clients: {
        total: totalClients,
        byStatus: clientsByStatus,
        topEngagement: topClients
      },
      interactions: {
        total: totalInteractions,
        recent: recentInteractions,
        byType: interactionsByType
      },
      followUps: {
        due: followUpsDue,
        overdue: overdueFollowUps
      },
      engagement: {
        distribution: engagementDistribution
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

// Engagement trends over time
router.get('/engagement-trends', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const trends = await Interaction.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          interactions: { $sum: 1 },
          avgEngagement: { $avg: '$priority' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const formattedTrends = trends.map(trend => ({
      date: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}-${String(trend._id.day).padStart(2, '0')}`,
      interactions: trend.interactions,
      avgEngagement: Math.round(trend.avgEngagement * 20) // Convert 1-5 scale to 20-100
    }));

    res.json(formattedTrends);
  } catch (error) {
    console.error('Engagement trends error:', error);
    res.status(500).json({ message: 'Error fetching engagement trends', error: error.message });
  }
});

// Interaction statistics with time periods
router.get('/interaction-stats', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    let groupBy = {};
    
    switch (period) {
      case 'week':
        groupBy = {
          year: { $year: '$date' },
          week: { $week: '$date' }
        };
        break;
      case 'month':
        groupBy = {
          year: { $year: '$date' },
          month: { $month: '$date' }
        };
        break;
      case 'quarter':
        groupBy = {
          year: { $year: '$date' },
          quarter: { $ceil: { $divide: [{ $month: '$date' }, 3] } }
        };
        break;
      default:
        groupBy = {
          year: { $year: '$date' },
          month: { $month: '$date' }
        };
    }

    const stats = await Interaction.aggregate([
      {
        $group: {
          _id: groupBy,
          totalInteractions: { $sum: 1 },
          emails: { $sum: { $cond: [{ $eq: ['$type', 'email'] }, 1, 0] } },
          meetings: { $sum: { $cond: [{ $eq: ['$type', 'meeting'] }, 1, 0] } },
          calls: { $sum: { $cond: [{ $eq: ['$type', 'call'] }, 1, 0] } },
          notes: { $sum: { $cond: [{ $eq: ['$type', 'note'] }, 1, 0] } },
          avgPriority: { $avg: '$priority' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.quarter': 1 } }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Interaction stats error:', error);
    res.status(500).json({ message: 'Error fetching interaction statistics', error: error.message });
  }
});

// Recent activity timeline
router.get('/recent-activity', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const recentActivity = await Interaction.find()
      .populate('clientId', 'name')
      .select('type subject date clientId outcome priority')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    const formattedActivity = recentActivity.map(activity => ({
      id: activity._id,
      type: activity.type,
      subject: activity.subject,
      date: activity.date,
      client: activity.clientId?.name || 'Unknown Client',
      outcome: activity.outcome,
      priority: activity.priority
    }));

    res.json(formattedActivity);
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ message: 'Error fetching recent activity', error: error.message });
  }
});

// Client performance metrics
router.get('/client-performance', async (req, res) => {
  try {
    const clientPerformance = await Client.aggregate([
      {
        $lookup: {
          from: 'interactions',
          localField: '_id',
          foreignField: 'clientId',
          as: 'interactions'
        }
      },
      {
        $project: {
          name: 1,
          engagementScore: 1,
          status: 1,
          interactionCount: { $size: '$interactions' },
          lastInteraction: { $max: '$interactions.date' },
          avgPriority: { $avg: '$interactions.priority' }
        }
      },
      { $sort: { engagementScore: -1 } }
    ]);

    res.json(clientPerformance);
  } catch (error) {
    console.error('Client performance error:', error);
    res.status(500).json({ message: 'Error fetching client performance', error: error.message });
  }
});

// Interaction type breakdown for dashboard bar chart
router.get('/interaction-type-summary', async (req, res) => {
  try {
    const interactionsByType = await Interaction.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({ interactionsByType });
  } catch (error) {
    console.error('Interaction type summary error:', error);
    res.status(500).json({ message: 'Error fetching interaction type summary', error: error.message });
  }
});


module.exports = router;
// Test route
router.get("/test", (req, res) => {
  console.log("🔥 Analytics test route called!");
  res.json({ message: "Analytics routes are working!", timestamp: new Date() });
});
