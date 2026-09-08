import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Add token to headers if present in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('skilltrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
