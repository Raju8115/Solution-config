import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

class AuthService {
  async login() {
    window.location.href = `${API_URL}/login`;
  }

  async logout() {
    try {
      const response = await axios.post(
        `${API_URL}/logout`,
        {},
        { withCredentials: true }
      );
      
      localStorage.removeItem('userRole');
      localStorage.removeItem('userRoles'); // ✅ Clear roles
      
      console.log(response.data);
      if (response.data.logout_url) {
        window.location.href = response.data.logout_url;
      }
      setTimeout(() => {
        window.location.href = "/login";
      }, 300);
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('userRole');
      localStorage.removeItem('userRoles');
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

  // ✅ NEW: Get user with roles from BlueGroups
  async getUserWithRoles() {
    try {
      const response = await axios.get(`${API_URL}/me`, {
        withCredentials: true
      });
      // console.log("getUser with roles ",response.data)
      return response.data; // { user: {...}, roles: {...} }
    } catch (error) {
      console.error('Get user with roles error:', error);
      throw error;
    }
  }

  async checkAuth() {
    try {
      const response = await axios.get(`${API_URL}/check`, {
        withCredentials: true
      });
      console.log("Response : ", response.data);
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