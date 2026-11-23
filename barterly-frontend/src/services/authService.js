import api from "./api";

/**
 * Auth Service
 * Handles all authentication-related API calls
 */

const authService = {
  /**
   * Sign in / sign up with a Google ID token (credential)
   */
  googleLogin: async (credential, rememberMe = true) => {
    try {
      const response = await api.post("/auth/google", { credential, rememberMe });
      localStorage.setItem("accessToken", response.data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Test login: sign in as a seeded user (local, or production with a test key)
   */
  devLogin: async (email, key) => {
    try {
      const response = await api.post("/auth/dev-login", { email, ...(key ? { key } : {}) });
      localStorage.setItem("accessToken", response.data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Logout user
   * @returns {Promise<Object>} - Logout result
   */
  logout: async () => {
    try {
      const response = await api.post("/auth/logout");

      // Clear stored data
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      return response.data;
    } catch (error) {
      // Clear local data even if API call fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      throw error.response?.data || error;
    }
  },

  /**
   * Get current user data
   * Requires authentication
   * @returns {Promise<Object>} - User data
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");

      // Update stored user data
      if (response.data.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("accessToken");
  },

  /**
   * Get stored user data
   * @returns {Object|null} - User data or null
   */
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

export default authService;
