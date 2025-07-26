const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Client = require('../models/Client');

// Validation middleware
const validateClient = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('company').trim().isLength({ min: 1 }).withMessage('Company is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  body('status').optional().isIn(['active', 'inactive', 'prospect', 'former']).withMessage('Invalid status')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @route   GET /api/clients
// @desc    Get all clients with filtering and pagination
// @access  Private (would need auth middleware in production)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const clients = await Client.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Client.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      clients,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalClients: total,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error while fetching clients' });
  }
});

// @route   GET /api/clients/:id
// @desc    Get client by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select('-__v');
    
    if (!client || !client.isActive) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server error while fetching client' });
  }
});

// @route   POST /api/clients
// @desc    Create new client
// @access  Private
router.post('/', validateClient, handleValidationErrors, async (req, res) => {
  try {
    // Check if client with email already exists
    const existingClient = await Client.findOne({ 
      email: req.body.email,
      isActive: true 
    });

    if (existingClient) {
      return res.status(400).json({ 
        message: 'Client with this email already exists' 
      });
    }

    // Create new client
    const clientData = {
      ...req.body,
      assignedTo: 'default-user' // In production, this would come from auth token
    };

    const client = new Client(clientData);
    
    // Calculate initial engagement score
    client.calculateEngagementScore();
    
    await client.save();

    res.status(201).json({
      message: 'Client created successfully',
      client
    });

  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Server error while creating client' });
  }
});

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', validateClient, handleValidationErrors, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client || !client.isActive) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if email is being changed and if it conflicts
    if (req.body.email && req.body.email !== client.email) {
      const existingClient = await Client.findOne({ 
        email: req.body.email,
        isActive: true,
        _id: { $ne: client._id }
      });

      if (existingClient) {
        return res.status(400).json({ 
          message: 'Another client with this email already exists' 
        });
      }
    }

    // Update client fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        client[key] = req.body[key];
      }
    });

    // Recalculate engagement score
    client.calculateEngagementScore();

    await client.save();

    res.json({
      message: 'Client updated successfully',
      client
    });

  } catch (error) {
    console.error('Error updating client:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server error while updating client' });
  }
});

// @route   DELETE /api/clients/:id
// @desc    Soft delete client
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client || !client.isActive) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Soft delete
    client.isActive = false;
    await client.save();

    res.json({ message: 'Client deleted successfully' });

  } catch (error) {
    console.error('Error deleting client:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server error while deleting client' });
  }
});

// @route   POST /api/clients/:id/calculate-engagement
// @desc    Recalculate engagement score for a client
// @access  Private
router.post('/:id/calculate-engagement', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client || !client.isActive) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const newScore = client.calculateEngagementScore();
    await client.save();

    res.json({
      message: 'Engagement score updated',
      engagementScore: newScore
    });

  } catch (error) {
    console.error('Error calculating engagement score:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server error while calculating engagement score' });
  }
});

// @route   GET /api/clients/stats/summary
// @desc    Get client statistics summary
// @access  Private
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Client.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          activeClients: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          prospects: {
            $sum: { $cond: [{ $eq: ['$status', 'prospect'] }, 1, 0] }
          },
          averageEngagementScore: { $avg: '$engagementScore' },
          highPriorityClients: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
          },
          criticalPriorityClients: {
            $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] }
          }
        }
      }
    ]);

    const summary = stats[0] || {
      totalClients: 0,
      activeClients: 0,
      prospects: 0,
      averageEngagementScore: 0,
      highPriorityClients: 0,
      criticalPriorityClients: 0
    };

    res.json(summary);

  } catch (error) {
    console.error('Error fetching client stats:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

module.exports = router;