import api from './api';

class ProductService {
  async getAllProducts() {
    const response = await api.get(`/products/all`);
    return response.data;
  }

  async getProductsByBrand(brandId) {
    const response = await api.get('/products', {
      params: { brand_id: brandId }
    });
    return response.data;
  }

  async getProductById(productId) {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  }

  async createProduct(productData) {
    const response = await api.post('/products', productData);
    return response.data;
  }

  async updateProduct(productId, productData) {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  }

  async deleteProduct(productId) {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  }
}

export default new ProductService();