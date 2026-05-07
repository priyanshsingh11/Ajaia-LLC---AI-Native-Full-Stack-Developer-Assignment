import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add interceptor to include auth token
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const documentsApi = {
  list: () => api.get('/documents').then(res => res.data),
  get: (id) => api.get(`/documents/${id}`).then(res => res.data),
  create: (data) => api.post('/documents', data).then(res => res.data),
  update: (id, data) => api.patch(`/documents/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/documents/${id}`).then(res => res.data),
  share: (id, email) => api.post(`/documents/${id}/share`, { email }).then(res => res.data),
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  }
};

export default api;
