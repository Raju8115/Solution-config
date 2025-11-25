import api from './api';

class WBSService {
  async getAllWBS(skip = 0, limit = 100) {
    const response = await api.get(`/wbs?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  async getWBSById(wbsId) {
    const response = await api.get(`/wbs/${wbsId}`);
    return response.data;
  }

  async createWBS(wbsData) {
    const response = await api.post('/wbs', wbsData);
    return response.data;
  }

  async updateWBS(wbsId, wbsData) {
    const response = await api.put(`/wbs/${wbsId}`, wbsData);
    return response.data;
  }

  async deleteWBS(wbsId) {
    const response = await api.delete(`/wbs/${wbsId}`);
    return response.data;
  }

  async getWBSForActivity(activityId) {
    const response = await api.get(`/wbs/activity/${activityId}/wbs`);
    return response.data;
  }

  async addWBSToActivity(activityId, wbsId) {
    const response = await api.post(`/wbs/activity/${activityId}/wbs/${wbsId}`);
    return response.data;
  }

  async removeWBSFromActivity(activityId, wbsId) {
    const response = await api.delete(`/wbs/activity/${activityId}/wbs/${wbsId}`);
    return response.data;
  }
}

export default new WBSService();