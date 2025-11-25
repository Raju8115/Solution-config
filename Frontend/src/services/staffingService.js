import api from './api';

class StaffingService {
  async getAllStaffing() {
    const response = await api.get('/staffingDetails/all');
    return response.data; 
  }

  async getStaffingByOffering(offeringId) {
    const response = await api.get(`/staffingDetails/${offeringId}`);
    return response.data;
  }

  async getStaffingByActivity(activityId) {
    const response = await api.get(`/staffingDetails/activity/${activityId}`);
    return response.data;
  }

  async getStaffingById(staffingId) {
    const response = await api.get(`/staffingDetails/detail/${staffingId}`);
    return response.data;
  }

  async createStaffing(staffingData) {
    const response = await api.post('/staffingDetails', staffingData);
    return response.data;
  }

  async updateStaffing(staffingId, staffingData) {
    const response = await api.put(`/staffingDetails/${staffingId}`, staffingData);
    return response.data;
  }

  async deleteStaffing(staffingId) {
    const response = await api.delete(`/staffingDetails/${staffingId}`);
    return response.data;
  }
}

export default new StaffingService();