import api from './api';

class ActivityService {
  async getAllActivities(skip = 0, limit = 100) {
    const response = await api.get(`/library?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  async getActivitiesByOffering(offeringId) {
    const response = await api.get(`/activities?offering_id=${offeringId}`);
    return response.data;
  }

  async getActivityById(activityId) {
    const response = await api.get(`/library/${activityId}`);
    return response.data;
  }

  async createActivity(activityData) {
    const response = await api.post('/library', activityData);
    return response.data;
  }

  async updateActivity(activityId, activityData) {
    const response = await api.put(`/library/${activityId}`, activityData);
    return response.data;
  }

  async deleteActivity(activityId) {
    const response = await api.delete(`/library/${activityId}`);
    return response.data;
  }

  async linkActivityToOffering(linkData) {
    const response = await api.post('/link', linkData);
    return response.data;
  }

  async unlinkActivityFromOffering(offeringId, activityId) {
    const response = await api.delete(`/unlink?offering_id=${offeringId}&activity_id=${activityId}`);
    return response.data;
  }
}

export default new ActivityService();