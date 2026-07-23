import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const api = axios.create({
  baseURL: `${API_BASE}/api/admin`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function createCertificate(payload) {
  const { data } = await api.post('/certificates', payload);
  return data;
}

export async function fetchCertificates() {
  const { data } = await api.get('/certificates');
  return data;
}

export async function verifyCertificateApi(certNo) {
  const { data } = await api.get(`/certificates/verify/${encodeURIComponent(certNo)}`);
  return data;
}

export async function deleteCertificate(id) {
  const { data } = await api.delete(`/certificates/${id}`);
  return data;
}
