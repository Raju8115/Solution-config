import api from './api';

class OfferingService {
  async getBrands() {
    const response = await api.get('/brands');
    return response.data;
  }

  async getBrandById(brandId) {
    const response = await api.get(`/brands/${brandId}`);
    return response.data;
  }

  async createBrand(brandData) {
    const response = await api.post('/brands', brandData);
    return response.data;
  }

  async updateBrand(brandId, brandData) {
    const response = await api.put(`/brands/${brandId}`, brandData);
    return response.data;
  }

  async deleteBrand(brandId) {
    const response = await api.delete(`/brands/${brandId}`);
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

  // ✅ Add create, update, delete methods to the class
  async createOffering(offeringData) {
    try {
      const response = await api.post('/offerings', offeringData);
      return response.data;
    } catch (error) {
      console.error('Error creating offering:', error);
      throw error;
    }
  }

  async updateOffering(offeringId, offeringData) {
    try {
      const response = await api.put(`/offerings/${offeringId}`, offeringData);
      return response.data;
    } catch (error) {
      console.error('Error updating offering:', error);
      throw error;
    }
  }

  async deleteOffering(offeringId) {
    try {
      const response = await api.delete(`/offerings/${offeringId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting offering:', error);
      throw error;
    }
  }
}

// ✅ Single export default
export default new OfferingService();