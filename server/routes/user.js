// server/routes/user.js
// Backend endpoints for user profile and preferences
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Mock user preferences (replace with database later)
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
    refreshInterval: 30000 // 30 seconds
  },
  privacy: {
    profileVisibility: 'team',
    activityTracking: true,
    dataSharing: false
  }
};

// GET /api/user/profile - Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Mock user profile (in real app, fetch from database)
    const userProfile = {
      id: userId,
      name: req.user.name || 'User',
      email: req.user.email || 'user@engage360.com',
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

// PUT /api/user/profile - Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address, linkedIn, twitter } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // In real app, update database
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

// GET /api/user/preferences - Get user preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const userId = req.user.id;

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

// PUT /api/user/preferences - Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Merge updates with existing preferences
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

// POST /api/user/change-password - Change user password
router.post('/change-password', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required'
      });
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // In real app, verify current password and update database
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

// GET /api/user/activity - Get user activity log
router.get('/activity', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    // Mock activity data
    const activities = [
      {
        id: 1,
        action: 'login',
        description: 'Logged into the system',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0'
      },
      {
        id: 2,
        action: 'client_created',
        description: 'Created new client: Acme Corporation',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0'
      },
      {
        id: 3,
        action: 'interaction_logged',
        description: 'Logged interaction with TechStart Inc',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0'
      },
      {
        id: 4,
        action: 'report_generated',
        description: 'Generated quarterly sales report',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0'
      },
      {
        id: 5,
        action: 'preferences_updated',
        description: 'Updated notification preferences',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
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

// DELETE /api/user/account - Delete user account
router.delete('/account', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password, confirmation } = req.body;

    // Validate deletion confirmation
    if (confirmation !== 'DELETE') {
      return res.status(400).json({
        success: false,
        message: 'Account deletion must be confirmed with "DELETE"'
      });
    }

    // In real app, verify password and delete account
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

// Utility function to format time ago
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