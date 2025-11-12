import api from './api';

class StaffingService {
  async getStaffingByOffering(offeringId) {
    try {
      const response = await api.get(`/staffingDetails/${offeringId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching staffing details:', error);
      throw error;
    }
  }

  async getStaffingById(staffingId) {
    try {
      const response = await api.get(`/staffingDetails/detail/${staffingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching staffing detail:', error);
      throw error;
    }
  }
}

export default new StaffingService();