import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE}/api/fees`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('studentToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchMyChallans() {
  const { data } = await api.get('/my-challans');
  return data;
}

/** Upload payment proof with screenshot (multipart) */
export async function uploadPaymentProof(challanId, formData) {
  const { data } = await api.post(`/upload-proof/${challanId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
