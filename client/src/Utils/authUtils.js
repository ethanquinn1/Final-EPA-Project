// client/src/utils/authUtils.js
export const authUtils = {
  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Set token in localStorage
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  // Remove token from localStorage
  removeToken: () => {
    localStorage.removeItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = authUtils.getToken();
    if (!token) return false;
    
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired
      if (tokenPayload.exp < currentTime) {
        authUtils.removeToken();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error parsing token:', error);
      authUtils.removeToken();
      return false;
    }
  },

  // Get user data from token
  getCurrentUser: () => {
    const token = authUtils.getToken();
    if (!token) return null;
    
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: tokenPayload.userId || tokenPayload.id,
        email: tokenPayload.email,
        name: tokenPayload.name || `${tokenPayload.firstName || ''} ${tokenPayload.lastName || ''}`.trim(),
        firstName: tokenPayload.firstName,
        lastName: tokenPayload.lastName,
        role: tokenPayload.role
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  },

  // Make authenticated API request
  apiRequest: async (url, options = {}) => {
    const token = authUtils.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      // If unauthorized, remove token and redirect to login
      if (response.status === 401) {
        authUtils.removeToken();
        window.location.href = '/login';
        return;
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
};