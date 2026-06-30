import api from './api';

const adminService = {
  getFlaggedMedia: async () => {
    const response = await api.get('/admin/flagged-media');
    return response.data;
  },

  reviewMedia: async (id, approve) => {
    const response = await api.put(`/admin/flagged-media/${id}`, { approve });
    return response.data;
  },

  overrideIssueAI: async (id, overrideData) => {
    const response = await api.put(`/admin/issues/${id}/override`, overrideData);
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  }
};

export default adminService;
