import api from './api';

class CountryService {
  async getCountries() {
    const response = await api.get('/countries');
    return response.data;
  }

  async getCountryById(countryId) {
    const response = await api.get(`/countries/${countryId}`);
    return response.data;
  }

  async createCountry(countryData) {
    const response = await api.post('/countries', countryData);
    return response.data;
  }

  async updateCountry(countryId, countryData) {
    const response = await api.put(`/countries/${countryId}`, countryData);
    return response.data;
  }

  async deleteCountry(countryId) {
    const response = await api.delete(`/countries/${countryId}`);
    return response.data;
  }
}

export default new CountryService();