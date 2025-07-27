const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class InteractionAPI {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/interactions${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Interaction API Error:', error);
      throw error;
    }
  }

  // Get all interactions with optional filtering
  async getInteractions(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`?${params}`);
  }

  // Get a single interaction by ID
  async getInteraction(id) {
    return this.request(`/${id}`);
  }

  // Create a new interaction
  async createInteraction(interactionData) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(interactionData),
    });
  }

  // Update an existing interaction
  async updateInteraction(id, interactionData) {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(interactionData),
    });
  }

  // Delete an interaction
  async deleteInteraction(id) {
    return this.request(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Get interactions for a specific client
  async getClientInteractions(clientId) {
    return this.request(`/client/${clientId}`);
  }

  // Get due follow-ups
  async getDueFollowUps(days = 7) {
    const params = new URLSearchParams({ days: days.toString() });
    return this.request(`/follow-ups/due?${params}`);
  }

  // Helper method to format interaction data for display
  formatInteractionForDisplay(interaction) {
    return {
      ...interaction,
      formattedDate: new Date(interaction.date).toLocaleDateString(),
      priorityText: this.getPriorityText(interaction.priority),
      typeText: interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)
    };
  }

  // Helper method to get priority text
  getPriorityText(priority) {
    switch (priority) {
      case 1: return 'Very Low';
      case 2: return 'Low';
      case 3: return 'Medium';
      case 4: return 'High';
      case 5: return 'Very High';
      default: return 'Unknown';
    }
  }
}

export const interactionAPI = new InteractionAPI();