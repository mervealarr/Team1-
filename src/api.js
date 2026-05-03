import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5237/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const getCurrentUserId = () => {
  const token = localStorage.getItem('token');
  const payload = parseJwt(token);

  return Number(
    payload?.sub ||
    payload?.nameid ||
    payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
  ) || null;
};

export const deleteAccount = () => {
  return api.delete('/user/delete');
};

export const updateProfile = (profileData) => {
  return api.put('/user/profile', profileData);
};

// Admin Endpoints
export const getAllUsers = () => {
  return api.get('/admin/users');
};

export const getAdminListings = () => {
  return api.get('/admin/listings');
};

export const adminDeleteUser = (id) => {
  return api.delete(`/admin/users/${id}`);
};

export const adminDeleteListing = (id) => {
  return api.delete(`/admin/listings/${id}`);
};

export const moderateListing = (id, isApproved) => {
  return api.put(`/admin/listings/${id}/moderate`, { isApproved });
};

// Message Endpoints
export const sendMessage = async (messageData) => {
  const response = await api.post('/messages', messageData);
  return response.data;
};

export const getInboxMessages = async () => {
  const response = await api.get('/messages/inbox');
  return response.data;
};

// Favorites Endpoints
export const toggleFavorite = async (listingId) => {
  const response = await api.post(`/favorites/${listingId}`);
  return response.data;
};

export const getFavorites = async () => {
  const response = await api.get('/favorites');
  return response.data;
};

export const getFavoriteIds = async () => {
  const response = await api.get('/favorites/ids');
  return response.data;
};

export default api;