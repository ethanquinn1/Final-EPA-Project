const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

router.get('/', auth, async (req, res) => {
  try {
    const quickActions = [
      {
        id: 'add-client',
        name: 'Add Client',
        description: 'Create new client record',
        icon: 'UserPlus',
        path: '/clients/new',
        category: 'clients',
        enabled: true,
        shortcut: 'Ctrl+Shift+C'
      },
      {
        id: 'log-interaction',
        name: 'Log Interaction',
        description: 'Record client interaction',
        icon: 'MessageSquare',
        path: '/interactions/new',
        category: 'interactions',
        enabled: true,
        shortcut: 'Ctrl+Shift+I'
      },
      {
        id: 'schedule-call',
        name: 'Schedule Call',
        description: 'Schedule phone call',
        icon: 'Phone',
        path: '/calls/new',
        category: 'communications',
        enabled: true,
        shortcut: 'Ctrl+Shift+P'
      },
      {
        id: 'send-email',
        name: 'Send Email',
        description: 'Send email to client',
        icon: 'Mail',
        path: '/emails/new',
        category: 'communications',
        enabled: true,
        shortcut: 'Ctrl+Shift+E'
      },
      {
        id: 'book-meeting',
        name: 'Book Meeting',
        description: 'Schedule client meeting',
        icon: 'Calendar',
        path: '/meetings/new',
        category: 'communications',
        enabled: true,
        shortcut: 'Ctrl+Shift+M'
      },
      {
        id: 'create-task',
        name: 'Create Task',
        description: 'Add follow-up task',
        icon: 'CheckSquare',
        path: '/tasks/new',
        category: 'tasks',
        enabled: true,
        shortcut: 'Ctrl+Shift+T'
      },
      {
        id: 'generate-report',
        name: 'Generate Report',
        description: 'Create analytics report',
        icon: 'FileText',
        path: '/reports/new',
        category: 'reports',
        enabled: true,
        shortcut: 'Ctrl+Shift+R'
      },
      {
        id: 'search-global',
        name: 'Global Search',
        description: 'Search across all data',
        icon: 'Search',
        path: '/search',
        category: 'search',
        enabled: true,
        shortcut: 'Ctrl+K'
      }
    ];

    res.json({
      success: true,
      data: {
        actions: quickActions,
        categories: ['clients', 'interactions', 'communications', 'tasks', 'reports', 'search']
      }
    });
  } catch (error) {
    console.error('Error fetching quick actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quick actions'
    });
  }
});

router.post('/execute', auth, async (req, res) => {
  try {
    const { actionId, data = {} } = req.body;
    const userId = req.user.id;

    console.log(`User ${userId} executed quick action: ${actionId}`, data);

    let result = {};
    
    switch (actionId) {
      case 'add-client':
        result = {
          message: 'Redirecting to add client form',
          redirect: '/clients/new',
          success: true
        };
        break;
        
      case 'log-interaction':
        result = {
          message: 'Redirecting to log interaction form',
          redirect: '/interactions/new',
          success: true
        };
        break;
        
      case 'schedule-call':
        result = {
          message: 'Redirecting to schedule call form',
          redirect: '/calls/new',
          success: true
        };
        break;
        
      case 'send-email':
        result = {
          message: 'Redirecting to email composer',
          redirect: '/emails/new',
          success: true
        };
        break;
        
      case 'book-meeting':
        result = {
          message: 'Redirecting to meeting scheduler',
          redirect: '/meetings/new',
          success: true
        };
        break;
        
      case 'create-task':
        result = {
          message: 'Redirecting to task creator',
          redirect: '/tasks/new',
          success: true
        };
        break;
        
      case 'generate-report':
        result = {
          message: 'Redirecting to report generator',
          redirect: '/reports/new',
          success: true
        };
        break;
        
      case 'search-global':
        result = {
          message: 'Opening global search',
          redirect: '/search',
          success: true
        };
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Unknown quick action'
        });
    }

    const notification = {
      type: 'action',
      title: 'Quick Action Executed',
      message: `Successfully executed: ${actionId}`,
      clientId: data.clientId || null,
      priority: 'low'
    };

    res.json({
      success: true,
      data: result,
      notification
    });
  } catch (error) {
    console.error('Error executing quick action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute quick action'
    });
  }
});

router.get('/recent', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const recentActions = [
      {
        id: 'log-interaction',
        name: 'Log Interaction',
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        useCount: 15
      },
      {
        id: 'add-client',
        name: 'Add Client',
        lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        useCount: 8
      },
      {
        id: 'send-email',
        name: 'Send Email',
        lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        useCount: 12
      }
    ];

    res.json({
      success: true,
      data: {
        recentActions: recentActions.sort((a, b) => b.lastUsed - a.lastUsed),
        totalActions: recentActions.length
      }
    });
  } catch (error) {
    console.error('Error fetching recent quick actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent quick actions'
    });
  }
});

router.post('/favorite', auth, async (req, res) => {
  try {
    const { actionId } = req.body;
    const userId = req.user.id;

    console.log(`User ${userId} favorited action: ${actionId}`);

    res.json({
      success: true,
      message: 'Quick action added to favorites',
      data: { actionId, favorited: true }
    });
  } catch (error) {
    console.error('Error favoriting quick action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to favorite quick action'
    });
  }
});

router.delete('/favorite/:actionId', auth, async (req, res) => {
  try {
    const { actionId } = req.params;
    const userId = req.user.id;

    console.log(`User ${userId} unfavorited action: ${actionId}`);

    res.json({
      success: true,
      message: 'Quick action removed from favorites',
      data: { actionId, favorited: false }
    });
  } catch (error) {
    console.error('Error unfavoriting quick action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unfavorite quick action'
    });
  }
});

module.exports = router;