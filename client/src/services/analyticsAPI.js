const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

class AnalyticsAPI {
  async request(endpoint, options = {}) {
    try {
      const fullUrl = `${API_BASE_URL}/analytics${endpoint}`;
      console.log(`🔍 Making analytics request to: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analytics API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Analytics API Error:', error);
      throw error;
    }
  }

  async getDashboardData() {
    return this.request('/dashboard');
  }

  async getEngagementTrends(days = 30) {
    return this.request(`/engagement-trends?days=${days}`);
  }

  async getInteractionStats(period = 'month') {
    return this.request(`/interaction-stats?period=${period}`);
  }

  async getRecentActivity(limit = 10) {
    return this.request(`/recent-activity?limit=${limit}`);
  }

  async getClientPerformance() {
    return this.request('/client-performance');
  }
}

export const analyticsAPI = new AnalyticsAPI();
