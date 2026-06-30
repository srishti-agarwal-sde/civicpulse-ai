import api from './api';

const issueService = {
  // Query issues list with filters
  getIssues: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.severity && filters.severity !== 'All') params.append('severity', filters.severity);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/issues?${params.toString()}`);
    return response.data;
  },

  // Get details for a single issue report
  getIssueById: async (id) => {
    const response = await api.get(`/issues/id/${id}`);
    return response.data;
  },

  // Check for duplicate issues nearby
  checkDuplicate: async (lat, lng, category = '', description = '') => {
    const response = await api.get('/issues/check-duplicate', {
      params: { lat, lng, category, description }
    });
    return response.data;
  },

  // Create a new issue report
  createIssue: async (formData) => {
    const response = await api.post('/issues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Submit additional evidence
  addEvidence: async (id, formData) => {
    const response = await api.post(`/issues/${id}/evidence`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Confirm issue existence
  confirmIssue: async (id) => {
    const response = await api.post(`/validation/${id}/confirm`);
    return response.data;
  },

  // Upvote issue Priority
  upvoteIssue: async (id) => {
    const response = await api.post(`/validation/${id}/upvote`);
    return response.data;
  },

  // Resolve issue Consensus (or Admin action)
  resolveIssue: async (id) => {
    const response = await api.post(`/validation/${id}/resolve`);
    return response.data;
  },

  // Comments management
  getComments: async (id) => {
    const response = await api.get(`/validation/${id}/comments`);
    return response.data;
  },

  addComment: async (id, text) => {
    const response = await api.post(`/validation/${id}/comments`, { text });
    return response.data;
  },

  // Leaderboard lists
  getLeaderboard: async () => {
    const response = await api.get('/leaderboard');
    return response.data;
  },

  // Dashboard analytics
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Notifications management
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Address Geocoding proxy
  getAddressSuggestions: async (q) => {
    const response = await api.get('/issues/address-suggestions', { params: { q } });
    return response.data;
  },

  getPlaceDetails: async (placeId) => {
    const response = await api.get('/issues/place-details', { params: { placeId } });
    return response.data;
  }
};

export default issueService;
