const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

// Mock notification data
let notifications = [
  {
    id: 1,
    userId: null, // Will be set dynamically
    type: 'followup',
    title: 'Follow-up due',
    message: 'Follow-up due: Acme Corporation',
    time: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    unread: true,
    clientId: null,
    priority: 'high'
  },
  {
    id: 2,
    userId: null,
    type: 'meeting',
    title: 'Meeting reminder',
    message: 'Meeting reminder: TechStart Inc at 3 PM',
    time: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    unread: true,
    clientId: null,
    priority: 'medium'
  },
  {
    id: 3,
    userId: null,
    type: 'success',
    title: 'Contract signed',
    message: 'Contract signed: Global Systems',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unread: false,
    clientId: null,
    priority: 'low'
  },
  {
    id: 4,
    userId: null,
    type: 'email',
    title: 'Email response',
    message: 'New email from Innovation Co',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    unread: true,
    clientId: null,
    priority: 'medium'
  },
  {
    id: 5,
    userId: null,
    type: 'task',
    title: 'Task overdue',
    message: 'Proposal deadline passed for Future Tech Ltd',
    time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    unread: true,
    clientId: null,
    priority: 'urgent'
  }
];

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

// GET /api/notifications - Get all notifications for user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Filter notifications for current user and format
    const userNotifications = notifications
      .map(notification => ({
        ...notification,
        userId,
        timeAgo: getTimeAgo(notification.time)
      }))
      .sort((a, b) => b.time - a.time); // Sort by newest first

    const unreadCount = userNotifications.filter(n => n.unread).length;

    res.json({
      success: true,
      data: {
        notifications: userNotifications,
        unreadCount,
        total: userNotifications.length
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// POST /api/notifications/mark-read/:id - Mark specific notification as read
router.post('/mark-read/:id', auth, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const notification = notifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.unread = false;

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { ...notification, timeAgo: getTimeAgo(notification.time) }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// POST /api/notifications/mark-all-read - Mark all notifications as read
router.post('/mark-all-read', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Mark all notifications as read for this user
    notifications.forEach(notification => {
      notification.unread = false;
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        markedCount: notifications.length
      }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// POST /api/notifications/create - Create new notification (internal use)
router.post('/create', auth, async (req, res) => {
  try {
    const { type, title, message, clientId, priority = 'medium' } = req.body;
    const userId = req.user.id;

    const newNotification = {
      id: notifications.length + 1,
      userId,
      type,
      title,
      message,
      time: new Date(),
      unread: true,
      clientId,
      priority
    };

    notifications.push(newNotification);

    res.json({
      success: true,
      message: 'Notification created',
      data: { ...newNotification, timeAgo: 'Just now' }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const index = notifications.findIndex(n => n.id === notificationId);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notifications.splice(index, 1);

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// GET /api/notifications/stats - Get notification statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userNotifications = notifications;
    const unreadCount = userNotifications.filter(n => n.unread).length;
    const todayCount = userNotifications.filter(n => {
      const today = new Date();
      const notificationDate = new Date(n.time);
      return notificationDate.toDateString() === today.toDateString();
    }).length;

    const typeStats = userNotifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total: userNotifications.length,
        unread: unreadCount,
        today: todayCount,
        byType: typeStats
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics'
    });
  }
});

module.exports = router;