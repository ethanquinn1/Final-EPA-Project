const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

let userPreferences = {
  theme: 'light',
  language: 'en',
  timezone: 'Europe/London',
  currency: 'GBP',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  notifications: {
    email: true,
    push: true,
    sms: false,
    followUps: true,
    meetings: true,
    contracts: true
  },
  dashboard: {
    layout: 'default',
    widgets: ['metrics', 'charts', 'recent-activity', 'follow-ups'],
    refreshInterval: 30000
  },
  privacy: {
    profileVisibility: 'team',
    activityTracking: true,
    dataSharing: false
  }
};

router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.userId;
    
    const userProfile = {
      id: userId,
      name: req.user?.name || 'User',
      email: req.user?.email || 'user@engage360.com',
      role: 'Admin',
      department: 'Sales',
      avatar: null,
      joinDate: new Date('2023-01-15'),
      lastLogin: new Date(),
      status: 'active',
      permissions: ['read', 'write', 'delete', 'admin'],
      contactInfo: {
        phone: '+44 20 1234 5678',
        address: 'London, UK',
        linkedIn: null,
        twitter: null
      },
      settings: userPreferences
    };

    res.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, phone, address, linkedIn, twitter } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    console.log(`Updating profile for user ${userId}:`, req.body);

    const updatedProfile = {
      id: userId,
      name,
      email,
      contactInfo: {
        phone: phone || '+44 20 1234 5678',
        address: address || 'London, UK',
        linkedIn: linkedIn || null,
        twitter: twitter || null
      },
      updatedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile'
    });
  }
});

router.get('/preferences', auth, async (req, res) => {
  try {
    const userId = req.userId;

    res.json({
      success: true,
      data: userPreferences
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user preferences'
    });
  }
});

router.put('/preferences', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const updates = req.body;

    userPreferences = {
      ...userPreferences,
      ...updates,
      notifications: {
        ...userPreferences.notifications,
        ...(updates.notifications || {})
      },
      dashboard: {
        ...userPreferences.dashboard,
        ...(updates.dashboard || {})
      },
      privacy: {
        ...userPreferences.privacy,
        ...(updates.privacy || {})
      }
    };

    console.log(`Updated preferences for user ${userId}:`, userPreferences);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: userPreferences
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user preferences'
    });
  }
});

router.post('/change-password', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    console.log(`Password change requested for user ${userId}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

router.get('/activity', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 20, offset = 0 } = req.query;

    const activities = [
      {
        id: 1,
        action: 'login',
        description: 'Logged into the system',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0'
      },
      {
        id: 2,
        action: 'client_created',
        description: 'Created new client: Acme Corporation',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0'
      }
    ];

    const paginatedActivities = activities
      .slice(offset, offset + limit)
      .map(activity => ({
        ...activity,
        timeAgo: getTimeAgo(activity.timestamp)
      }));

    res.json({
      success: true,
      data: {
        activities: paginatedActivities,
        total: activities.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity'
    });
  }
});

router.delete('/account', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { password, confirmation } = req.body;

    if (confirmation !== 'DELETE') {
      return res.status(400).json({
        success: false,
        message: 'Account deletion must be confirmed with "DELETE"'
      });
    }

    console.log(`Account deletion requested for user ${userId}`);

    res.json({
      success: true,
      message: 'Account deletion initiated. You will receive a confirmation email.'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

const getTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''} ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

module.exports = router;