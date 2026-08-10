import { API_BASE_URL, getAuthHeader } from './supabaseAuth';

export const dbService = {
  // 1. Fetch properties (supports queries/filters)
  async fetchProperties(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      for (const [key, val] of Object.entries(filters)) {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, val);
        }
      }

      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}/properties${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      const resData = await response.json();
      if (!response.ok) return { data: [], error: resData.error || 'Failed to fetch properties.' };
      return { data: resData.properties, error: null };
    } catch (error) {
      console.error('dbService.fetchProperties error:', error);
      return { data: [], error: 'Backend server is unreachable.' };
    }
  },

  // 2. Fetch single property details
  async fetchProperty(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${id}`);
      const resData = await response.json();
      if (!response.ok) return { data: null, error: resData.error || 'Failed to fetch property details.' };
      return { data: resData.property, error: null };
    } catch (error) {
      return { data: null, error: 'Backend server is unreachable.' };
    }
  },

  // 3. Create property listing
  async createProperty(property) {
    try {
      const response = await fetch(`${API_BASE_URL}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(property)
      });
      const resData = await response.json();
      if (!response.ok) return { data: null, error: resData.error || 'Failed to create listing.' };
      return { data: resData.property, error: null };
    } catch (error) {
      return { data: null, error: 'Backend server is unreachable.' };
    }
  },

  // 4. Delete property listing
  async deleteProperty(propertyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      const resData = await response.json();
      if (!response.ok) return { error: resData.error || 'Failed to delete listing.' };
      return { error: null };
    } catch (error) {
      return { error: 'Backend server is unreachable.' };
    }
  },

  // 5. Fetch user's favorite property IDs
  async fetchFavorites() {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        headers: getAuthHeader()
      });
      const resData = await response.json();
      if (!response.ok) return { data: [], error: resData.error || 'Failed to fetch favorites.' };
      return { data: resData.favorites, error: null };
    } catch (error) {
      return { data: [], error: 'Backend server is unreachable.' };
    }
  },

  // 6. Toggle favorite
  async toggleFavorite(propertyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites/${propertyId}`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      const resData = await response.json();
      if (!response.ok) return { favorited: null, error: resData.error || 'Failed to toggle favorite.' };
      return { favorited: resData.favorited, error: null };
    } catch (error) {
      return { favorited: null, error: 'Backend server is unreachable.' };
    }
  },

  // 7. Fetch user's conversations
  async fetchConversations() {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        headers: getAuthHeader()
      });
      const resData = await response.json();
      if (!response.ok) return { data: [], error: resData.error || 'Failed to fetch conversations.' };
      return { data: resData.conversations, error: null };
    } catch (error) {
      return { data: [], error: 'Backend server is unreachable.' };
    }
  },

  // 8. Start conversation
  async startConversation(propertyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ propertyId })
      });
      const resData = await response.json();
      if (!response.ok) return { data: null, error: resData.error || 'Failed to start chat.' };
      return { data: resData.conversation, error: null };
    } catch (error) {
      return { data: null, error: 'Backend server is unreachable.' };
    }
  },

  // 9. Send message
  async sendMessage(convoId, text) {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${convoId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ text })
      });
      const resData = await response.json();
      if (!response.ok) return { data: null, error: resData.error || 'Failed to send message.' };
      return { data: resData.message, error: null };
    } catch (error) {
      return { data: null, error: 'Backend server is unreachable.' };
    }
  },

  // 10. Fetch user's notifications
  async fetchNotifications() {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: getAuthHeader()
      });
      const resData = await response.json();
      if (!response.ok) return { data: [], error: resData.error || 'Failed to fetch notifications.' };
      return { data: resData.notifications, error: null };
    } catch (error) {
      return { data: [], error: 'Backend server is unreachable.' };
    }
  },

  // 11. Mark all notifications as read
  async markNotificationsRead() {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/read`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      const resData = await response.json();
      if (!response.ok) return { error: resData.error || 'Failed to mark read.' };
      return { error: null };
    } catch (error) {
      return { error: 'Backend server is unreachable.' };
    }
  },

  // 12. Clear all notifications
  async clearNotifications() {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/clear`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      const resData = await response.json();
      if (!response.ok) return { error: resData.error || 'Failed to clear.' };
      return { error: null };
    } catch (error) {
      return { error: 'Backend server is unreachable.' };
    }
  },

  // 13. Verify Listing (Admin only)
  async verifyPropertyListing(propertyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/verify`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      const resData = await response.json();
      if (!response.ok) return { error: resData.error || 'Failed to verify property.' };
      return { error: null };
    } catch (error) {
      return { error: 'Backend server is unreachable.' };
    }
  },

  // 14. Verify Owner (Admin only)
  async verifyOwnerListing(propertyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/verify-owner`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      const resData = await response.json();
      if (!response.ok) return { error: resData.error || 'Failed to verify owner.' };
      return { error: null };
    } catch (error) {
      return { error: 'Backend server is unreachable.' };
    }
  },

  // 15. Mark as sold/rented
  async markAsSoldOrRented(propertyId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ availability: status })
      });
      const resData = await response.json();
      if (!response.ok) return { error: resData.error || 'Failed to update status.' };
      return { error: null };
    } catch (error) {
      return { error: 'Backend server is unreachable.' };
    }
  }
};
