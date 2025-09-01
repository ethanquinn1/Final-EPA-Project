const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Interaction = require('../models/Interaction');

// Global search across clients and interactions
router.get('/global', async (req, res) => {
  try {
    const { q, type, status, dateFrom, dateTo, tags } = req.query;
    
    // If no search query, return empty results
    if (!q || q.trim().length < 2) {
      return res.json({
        clients: [],
        interactions: [],
        totalResults: 0
      });
    }
    
    let clientQuery = {};
    let interactionQuery = {};
    
    // Text search with regex (case-insensitive)
    const searchRegex = { $regex: q.trim(), $options: 'i' };
    
    clientQuery.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { company: searchRegex },
      { notes: searchRegex }
    ];
    
    interactionQuery.$or = [
      { subject: searchRegex },
      { content: searchRegex },
      { followUpNotes: searchRegex }
    ];
    
    // Filter by client status
    if (status && status !== '') {
      clientQuery.status = status;
    }
    
    // Filter by interaction type
    if (type && type !== '') {
      interactionQuery.type = type;
    }
    
    // Date range filter for interactions
    if (dateFrom || dateTo) {
      interactionQuery.date = {};
      if (dateFrom) {
        interactionQuery.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        interactionQuery.date.$lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }
    
    // Tag filter
    if (tags && tags.trim() !== '') {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tagArray.length > 0) {
        clientQuery.tags = { $in: tagArray };
        interactionQuery.tags = { $in: tagArray };
      }
    }
    
    // Execute searches with limits
    const [clients, interactions] = await Promise.all([
      Client.find(clientQuery)
        .select('name email company status engagementScore tags')
        .limit(20)
        .sort({ updatedAt: -1 }),
      Interaction.find(interactionQuery)
        .populate('clientId', 'name company')
        .select('subject content type date priority outcome clientId')
        .limit(30)
        .sort({ date: -1 })
    ]);
    
    // Calculate total results
    const totalResults = clients.length + interactions.length;
    
    res.json({
      clients,
      interactions,
      totalResults,
      query: {
        searchTerm: q,
        filters: { type, status, dateFrom, dateTo, tags }
      }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      clients: [],
      interactions: [],
      totalResults: 0
    });
  }
});

// Quick search suggestions (for autocomplete)
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const searchRegex = { $regex: q.trim(), $options: 'i' };
    
    // Get client name suggestions
    const clientSuggestions = await Client.find(
      { name: searchRegex },
      { name: 1, company: 1 }
    ).limit(5);
    
    // Get interaction subject suggestions
    const interactionSuggestions = await Interaction.find(
      { subject: searchRegex },
      { subject: 1 }
    ).limit(5);
    
    const suggestions = [
      ...clientSuggestions.map(c => ({ type: 'client', text: c.name, subtext: c.company })),
      ...interactionSuggestions.map(i => ({ type: 'interaction', text: i.subject }))
    ];
    
    res.json({ suggestions });
    
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ suggestions: [] });
  }
});

// Search analytics (for admin dashboard)
router.get('/analytics', async (req, res) => {
  try {
    const [
      totalClients,
      totalInteractions,
      recentClients,
      recentInteractions
    ] = await Promise.all([
      Client.countDocuments(),
      Interaction.countDocuments(),
      Client.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      Interaction.countDocuments({ 
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);
    
    res.json({
      totalClients,
      totalInteractions,
      recentClients,
      recentInteractions,
      searchableItems: totalClients + totalInteractions
    });
    
  } catch (error) {
    console.error('Search analytics error:', error);
    res.status(500).json({ error: 'Failed to get search analytics' });
  }
});

module.exports = router;