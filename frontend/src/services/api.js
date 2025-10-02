import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nextread_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (email, password) => {
    try {
      const response = await api.post('/register', { email, password });
      if (response.data.access_token) {
        localStorage.setItem('nextread_token', response.data.access_token);
      }
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed'
      };
    }
  },

  login: async (email, password) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post(`${API_BASE_URL}/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.access_token) {
        localStorage.setItem('nextread_token', response.data.access_token);
      }

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  },
};

export const goalsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/goals');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch goals',
        data: []
      };
    }
  },

  // Function to SET/REPLACE all user goals with a list (uses PUT)
  setGoals: async (goalIds) => {
    try {
      const response = await api.put(`/users/me/goals`, { goal_ids: goalIds });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to save goals'
      };
    }
  },

  // Function to ADD a single goal (uses POST)
  addGoal: async (goalId) => {
    try {
      const response = await api.post(`/users/me/goals`, { goal_id: goalId });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to add goal'
      };
    }
  },

  // Function to DELETE a single goal (uses DELETE)
  deleteGoal: async (goalId) => {
    try {
      const response = await api.delete(`/users/me/goals/${goalId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to delete goal'
      };
    }
  },
};

export const booksAPI = {
  getPopular: async () => {
    try {
      const response = await api.get('/books/popular');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch popular books',
        data: []
      };
    }
  },

  // --- ADD THIS NEW SEARCH FUNCTION ---
  search: async (query) => {
    if (!query) return { success: false, error: 'Search query cannot be empty.' };
    try {
      // Make a GET request to the search endpoint with the query parameter
      const response = await api.get(`/books/search?q=${encodeURIComponent(query)}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Search failed',
        data: []
      };
    }
  },

  getById: async (bookId) => {
    try {
      const response = await api.get(`/books/${bookId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch book details',
        data: null
      };
    }
  },

  rate: async (bookId, rating) => {
    try {
      const response = await api.post(`/books/${bookId}/rate`, { rating });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to rate book'
      };
    }
  },

  getRecommendations: async () => {
    try {
      const response = await api.get('/users/me/recommendations');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch recommendations',
        data: []
      };
    }
  },
};

export default api;