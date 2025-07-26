import api from './api';

export const interactionAPI = {
  // Get all interactions with filtering and pagination
  getInteractions: async (params = {}) => {
    try {
      const response = await api.get('/interactions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching interactions:', error);
      throw error;
    }
  },

  // Get single interaction by ID
  getInteraction: async (id) => {
    try {
      const response = await api.get(`/interactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching interaction:', error);
      throw error;
    }
  },

  // Create new interaction
  createInteraction: async (data) => {
    try {
      const response = await api.post('/interactions', data);
      return response.data;
    } catch (error) {
      console.error('Error creating interaction:', error);
      throw error;
    }
  },

  // Update interaction
  updateInteraction: async (id, data) => {
    try {
      const response = await api.put(`/interactions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating interaction:', error);
      throw error;
    }
  },

  // Delete interaction
  deleteInteraction: async (id) => {
    try {
      const response = await api.delete(`/interactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting interaction:', error);
      throw error;
    }
  },

  // Get interactions for specific client
  getClientInteractions: async (clientId, params = {}) => {
    try {
      const response = await api.get(`/interactions/client/${clientId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching client interactions:', error);
      throw error;
    }
  },

  // Get interactions with due follow-ups
  getDueFollowUps: async (days = 7) => {
    try {
      const response = await api.get('/interactions/follow-ups/due', { 
        params: { days } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching due follow-ups:', error);
      throw error;
    }
  },

  // Helper function to format interaction for display
  formatInteraction: (interaction) => {
    return {
      ...interaction,
      formattedDate: new Date(interaction.date).toLocaleDateString(),
      formattedTime: new Date(interaction.date).toLocaleTimeString(),
      formattedDateTime: new Date(interaction.date).toLocaleString(),
      followUpDateFormatted: interaction.followUpDate 
        ? new Date(interaction.followUpDate).toLocaleDateString()
        : null,
      durationFormatted: interaction.duration 
        ? `${interaction.duration} min${interaction.duration !== 1 ? 's' : ''}`
        : null,
      typeIcon: {
        email: '📧',
        meeting: '🤝',
        call: '📞',
        note: '📝'
      }[interaction.type] || '📝',
      priorityColor: {
        low: '#10b981',
        medium: '#f59e0b',
        high: '#ef4444'
      }[interaction.priority] || '#6b7280',
      outcomeColor: {
        positive: '#10b981',
        neutral: '#6b7280',
        negative: '#ef4444',
        'follow-up-needed': '#f59e0b'
      }[interaction.outcome] || '#6b7280'
    };
  },

  // Get interaction statistics
  getInteractionStats: async (clientId = null) => {
    try {
      const params = clientId ? { clientId } : {};
      const response = await api.get('/interactions', { params });
      const interactions = response.data.interactions || [];

      const stats = {
        total: interactions.length,
        byType: {
          email: interactions.filter(i => i.type === 'email').length,
          meeting: interactions.filter(i => i.type === 'meeting').length,
          call: interactions.filter(i => i.type === 'call').length,
          note: interactions.filter(i => i.type === 'note').length
        },
        byOutcome: {
          positive: interactions.filter(i => i.outcome === 'positive').length,
          neutral: interactions.filter(i => i.outcome === 'neutral').length,
          negative: interactions.filter(i => i.outcome === 'negative').length,
          'follow-up-needed': interactions.filter(i => i.outcome === 'follow-up-needed').length
        },
        followUpsRequired: interactions.filter(i => i.followUpRequired).length,
        averageDuration: interactions.filter(i => i.duration).length > 0
          ? Math.round(
              interactions.filter(i => i.duration)
                         .reduce((sum, i) => sum + i.duration, 0) / 
              interactions.filter(i => i.duration).length
            )
          : 0
      };

      return stats;
    } catch (error) {
      console.error('Error getting interaction stats:', error);
      throw error;
    }
  }
};