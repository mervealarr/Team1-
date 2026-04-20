import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5237/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally attach token if exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const parseJwt = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const getCurrentUserId = () => {
  const token = localStorage.getItem('token');
  const payload = parseJwt(token);
  return payload && payload.sub ? parseInt(payload.sub, 10) : null;
};

export const deleteAccount = () => {
  return api.delete('/user/delete');
};

export default api;
