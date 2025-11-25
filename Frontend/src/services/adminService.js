import api from './api'; // Your axios instance

const adminService = {
  // Get all admin stats in a single call
  getAdminStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  // Get detailed stats with breakdowns
  getDetailedAdminStats: async () => {
    try {
      const response = await api.get('/admin/stats/detailed');
      return response.data;
    } catch (error) {
      console.error('Error fetching detailed admin stats:', error);
      throw error;
    }
  },
};

export default adminService;
