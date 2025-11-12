import api from './api';

class CountryService {
  async getCountries() {
    try {
      const response = await api.get('/countries');
      return response.data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }
}

export default new CountryService();