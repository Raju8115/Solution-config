import api from './api';

class OfferingService {
  async getBrands() {
    const response = await api.get('/brands');
    return response.data;
  }

  async getProducts(brandId) {
    const response = await api.get(`/products?brand_id=${brandId}`);
    return response.data;
  }

  async getOfferings(productId) {
    const response = await api.get(`/offerings?product_id=${productId}`);
    return response.data;
  }

  async searchOfferings(params) {
    const response = await api.get('/offerings/search/', { params });
    return response.data;
  }

  async getOfferingById(offeringId) {
    const response = await api.get(`/offerings/${offeringId}`);
    return response.data;
  }

  async getTotalHoursAndPrices(offeringId) {
    const response = await api.get(`/totalHoursAndPrices/${offeringId}`);
    return response.data;
  }
}

export default new OfferingService();