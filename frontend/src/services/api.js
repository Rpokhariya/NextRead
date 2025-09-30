import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/register', userData),

  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response;
  },
};

export const goalsAPI = {
  getAllGoals: () => api.get('/goals'),

  setUserGoal: (goalId) => api.post(`/users/me/goal?goal_id=${goalId}`),
};

export const booksAPI = {
  getPopularBooks: () => api.get('/books/popular'),

  searchBooks: (query) => api.get('/books/search', { params: { q: query } }),

  getBookDetails: (bookId) => api.get(`/books/${bookId}`),

  rateBook: (bookId, rating) => api.post(`/books/${bookId}/rate`, { rating }),

  getRecommendations: () => api.get('/users/me/recommendations'),
};

export default api;