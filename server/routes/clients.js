const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Client = require('../models/Client');
const Interaction = require('../models/Interaction');

// GET /api/clients - Get all clients with optional search and filtering
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const [clients, totalCount] = await Promise.all([
      Client.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Client.countDocuments(query)
    ]);
    
    res.json({
      clients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + clients.length < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/clients/:id - Get single client
router.get('/:id', async (req, res) => {
  try {
    const clientId = req.params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }
    
    const client = await Client.findById(clientId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/clients/:id/detail - Get detailed client information with interactions and analytics
router.get('/:id/detail', async (req, res) => {
  try {
    const clientId = req.params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    // Get client information
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Get client interactions (sorted by date, most recent first)
    const interactions = await Interaction.find({ clientId: new mongoose.Types.ObjectId(clientId) })
      .sort({ date: -1 })
      .limit(50);

    // Get engagement score history (last 12 months)
    const engagementHistory = await Interaction.aggregate([
      { $match: { clientId: new mongoose.Types.ObjectId(clientId) } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          avgScore: { $avg: '$priority' },
          interactionCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Get interaction type breakdown
    const interactionTypeStats = await Interaction.aggregate([
      { $match: { clientId: new mongoose.Types.ObjectId(clientId) } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get upcoming follow-ups
    const upcomingFollowUps = await Interaction.find({
      clientId: new mongoose.Types.ObjectId(clientId),
      followUpDate: { $gte: new Date() },
      outcome: { $ne: 'completed' }
    }).sort({ followUpDate: 1 });

    // Get overdue follow-ups
    const overdueFollowUps = await Interaction.find({
      clientId: new mongoose.Types.ObjectId(clientId),
      followUpDate: { $lt: new Date() },
      outcome: { $ne: 'completed' }
    }).sort({ followUpDate: 1 });

    // Combine upcoming and overdue
    const allFollowUps = [...overdueFollowUps, ...upcomingFollowUps];

    res.json({
      client,
      interactions,
      engagementHistory,
      interactionTypeStats,
      upcomingFollowUps: allFollowUps,
      analytics: {
        totalInteractions: interactions.length,
        avgPriority: interactions.length > 0 ? 
          interactions.reduce((sum, i) => sum + i.priority, 0) / interactions.length : 0,
        lastInteraction: interactions.length > 0 ? interactions[0].date : null,
        pendingFollowUps: allFollowUps.length,
        overdueFollowUps: overdueFollowUps.length,
        recentActivity: interactions.filter(i => 
          new Date(i.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length
      }
    });
  } catch (error) {
    console.error('Error fetching client detail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/clients - Create new client
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, status, tags, notes } = req.body;
    
    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Check if email already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ error: 'Client with this email already exists' });
    }
    
    // Create new client
    const client = new Client({
      name,
      email,
      phone,
      company: company || name, // Default company to name if not provided
      status: status || 'prospect',
      engagementScore: 50, // Default starting score
      tags: tags || [],
      notes
    });
    
    await client.save();
    
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    if (error.code === 11000) {
      // Duplicate key error
      res.status(400).json({ error: 'Client with this email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT /api/clients/:id - Update client
router.put('/:id', async (req, res) => {
  try {
    const clientId = req.params.id;
    const updates = req.body;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }
    
    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;
    
    // If email is being updated, check for duplicates
    if (updates.email) {
      const existingClient = await Client.findOne({ 
        email: updates.email, 
        _id: { $ne: clientId } 
      });
      if (existingClient) {
        return res.status(400).json({ error: 'Client with this email already exists' });
      }
    }
    
    const client = await Client.findByIdAndUpdate(
      clientId,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Client with this email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PATCH /api/clients/:id/engagement-score - Update engagement score
router.patch('/:id/engagement-score', async (req, res) => {
  try {
    const clientId = req.params.id;
    const { score } = req.body;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }
    
    // Validate score
    if (typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({ error: 'Score must be a number between 0 and 100' });
    }
    
    const client = await Client.findByIdAndUpdate(
      clientId,
      { engagementScore: score },
      { new: true }
    );
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ message: 'Engagement score updated', client });
  } catch (error) {
    console.error('Error updating engagement score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/clients/:id - Delete client
router.delete('/:id', async (req, res) => {
  try {
    const clientId = req.params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }
    
    // Check if client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Delete all associated interactions
    await Interaction.deleteMany({ clientId: new mongoose.Types.ObjectId(clientId) });
    
    // Delete the client
    await Client.findByIdAndDelete(clientId);
    
    res.json({ message: 'Client and associated interactions deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/clients/:id/interactions - Get all interactions for a specific client
router.get('/:id/interactions', async (req, res) => {
  try {
    const clientId = req.params.id;
    const { page = 1, limit = 20, type, outcome } = req.query;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }
    
    // Check if client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    let query = { clientId: new mongoose.Types.ObjectId(clientId) };
    
    // Add filters
    if (type) query.type = type;
    if (outcome) query.outcome = outcome;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get interactions with pagination
    const [interactions, totalCount] = await Promise.all([
      Interaction.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Interaction.countDocuments(query)
    ]);
    
    res.json({
      interactions,
      client: { name: client.name, company: client.company },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + interactions.length < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching client interactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/clients/stats/overview - Get client statistics overview
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalClients,
      clientsByStatus,
      recentClients,
      topClients
    ] = await Promise.all([
      Client.countDocuments(),
      Client.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Client.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name company status createdAt'),
      Client.find()
        .sort({ engagementScore: -1 })
        .limit(5)
        .select('name company engagementScore')
    ]);
    
    res.json({
      totalClients,
      clientsByStatus,
      recentClients,
      topClients
    });
  } catch (error) {
    console.error('Error fetching client stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;