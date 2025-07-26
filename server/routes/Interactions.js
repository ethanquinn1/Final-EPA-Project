const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Interaction = require('../models/Interaction');
const Client = require('../models/Client');
const router = express.Router();

// Validation middleware
const validateInteraction = [
  body('clientId')
    .isMongoId()
    .withMessage('Valid client ID is required')
    .custom(async (value) => {
      const client = await Client.findById(value);
      if (!client) {
        throw new Error('Client not found');
      }
      return true;
    }),
  body('type')
    .isIn(['email', 'meeting', 'call', 'note'])
    .withMessage('Type must be email, meeting, call, or note'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject is required and must be less than 200 characters'),
  body('content')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Content must be less than 5000 characters'),
  body('duration')
    .optional()
    .isInt({ min: 0, max: 1440 })
    .withMessage('Duration must be a positive number (max 24 hours)'),
  body('outcome')
    .optional()
    .isIn(['positive', 'neutral', 'negative', 'follow-up-needed', ''])
    .withMessage('Invalid outcome value'),
  body('followUpRequired')
    .optional()
    .isBoolean()
    .withMessage('Follow up required must be a boolean'),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Follow up date must be a valid date'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

// GET /api/interactions - Get all interactions with filtering
router.get('/', [
  query('clientId').optional().isMongoId().withMessage('Invalid client ID'),
  query('type').optional().isIn(['email', 'meeting', 'call', 'note']),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['date', '-date', 'subject', '-subject', 'type', '-type']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      clientId,
      type,
      page = 1,
      limit = 20,
      sort = '-date',
      search,
      startDate,
      endDate,
      followUpRequired,
      priority
    } = req.query;

    // Build filter object
    const filter = {};
    if (clientId) filter.clientId = clientId;
    if (type) filter.type = type;
    if (followUpRequired !== undefined) filter.followUpRequired = followUpRequired === 'true';
    if (priority) filter.priority = priority;
    
    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Search in subject and content
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const interactions = await Interaction.find(filter)
      .populate('clientId', 'name company email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Interaction.countDocuments(filter);

    res.json({
      interactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

// GET /api/interactions/:id - Get single interaction
router.get('/:id', async (req, res) => {
  try {
    const interaction = await Interaction.findById(req.params.id)
      .populate('clientId', 'name company email phone status');
    
    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    res.json(interaction);
  } catch (error) {
    console.error('Error fetching interaction:', error);
    res.status(500).json({ error: 'Failed to fetch interaction' });
  }
});

// POST /api/interactions - Create new interaction
router.post('/', validateInteraction, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const interaction = new Interaction(req.body);
    await interaction.save();
    
    // Populate client data for response
    await interaction.populate('clientId', 'name company email');

    res.status(201).json(interaction);
  } catch (error) {
    console.error('Error creating interaction:', error);
    res.status(500).json({ error: 'Failed to create interaction' });
  }
});

// PUT /api/interactions/:id - Update interaction
router.put('/:id', validateInteraction, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const interaction = await Interaction.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('clientId', 'name company email');

    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    res.json(interaction);
  } catch (error) {
    console.error('Error updating interaction:', error);
    res.status(500).json({ error: 'Failed to update interaction' });
  }
});

// DELETE /api/interactions/:id - Delete interaction
router.delete('/:id', async (req, res) => {
  try {
    const interaction = await Interaction.findByIdAndDelete(req.params.id);
    
    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    res.json({ message: 'Interaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting interaction:', error);
    res.status(500).json({ error: 'Failed to delete interaction' });
  }
});

// GET /api/clients/:clientId/interactions - Get interactions for specific client
router.get('/client/:clientId', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['email', 'meeting', 'call', 'note']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { clientId } = req.params;
    const { page = 1, limit = 20, type, sort = '-date' } = req.query;

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const filter = { clientId };
    if (type) filter.type = type;

    const skip = (page - 1) * limit;
    const interactions = await Interaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Interaction.countDocuments(filter);

    res.json({
      interactions,
      client: {
        id: client._id,
        name: client.name,
        company: client.company
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching client interactions:', error);
    res.status(500).json({ error: 'Failed to fetch client interactions' });
  }
});

// GET /api/interactions/follow-ups/due - Get interactions with due follow-ups
router.get('/follow-ups/due', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(days));

    const interactions = await Interaction.find({
      followUpRequired: true,
      followUpDate: { $lte: dueDate }
    })
    .populate('clientId', 'name company email phone')
    .sort('followUpDate');

    res.json(interactions);
  } catch (error) {
    console.error('Error fetching due follow-ups:', error);
    res.status(500).json({ error: 'Failed to fetch due follow-ups' });
  }
});

module.exports = router;