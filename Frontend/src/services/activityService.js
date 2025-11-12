import api from './api';

class ActivityService {
  async getActivitiesByOffering(offeringId) {
    try {
      const response = await api.get('/activities', {
        params: { offering_id: offeringId }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  async getActivityById(activityId) {
    try {
      const response = await api.get(`/activities/${activityId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  }
}

export default new ActivityService();