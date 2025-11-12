import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

class AuthService {
  async login() {
    // Redirect to backend login endpoint
    // Backend will redirect to IBM AppID, then back to /auth/callback, then to frontend
    window.location.href = `${API_URL}/login`;
  }

  async logout() {
    try {
      const response = await axios.post(
        `${API_URL}/logout`,
        {},
        { withCredentials: true }
      );
      
      // Clear local storage
      localStorage.removeItem('userRole');
      
      console.log(response.data)
      // Redirect to AppID logout
      if (response.data.logout_url) {
        window.location.href = response.data.logout_url;
      }
      setTimeout(() => {
        window.location.href = "/login";
      }, 300);
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
  }

  async getCurrentUser() {
    try {
      const response = await axios.get(`${API_URL}/user`, {
        withCredentials: true
      });
      return response.data.user;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  async checkAuth() {
    try {
      const response = await axios.get(`${API_URL}/check`, {
        withCredentials: true
      });
      console.log("Response : ", response.data)
      return response.data;
    } catch (error) {
      console.error('Check auth error:', error);
      return { authenticated: false, user: null };
    }
  }

  async validateSession() {
    try {
      const response = await axios.get(`${API_URL}/validate`, {
        withCredentials: true
      });
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService();