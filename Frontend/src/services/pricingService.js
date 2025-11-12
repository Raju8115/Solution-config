import api from './api';

class PricingService {
  async getPricingDetails(staffingId, country) {
    try {
      const response = await api.get('/pricingDetails', {
        params: {
          staffing_id: staffingId,
          country: country
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing details:', error);
      throw error;
    }
  }

  async getTotalHoursAndPrices(offeringId) {
    try {
      const response = await api.get(`/totalHoursAndPrices/${offeringId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching total hours and prices:', error);
      throw error;
    }
  }
}

export default new PricingService();