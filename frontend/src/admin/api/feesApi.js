import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const api = axios.create({
  baseURL: `${API_BASE}/api/fees`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function generateChallans(payload) {
  const { data } = await api.post('/generate', payload);
  return data;
}

export async function fetchAllChallans(params = {}) {
  const { data } = await api.get('/all', { params });
  return data;
}

export async function fetchPendingChallans() {
  const { data } = await api.get('/pending');
  return data;
}

export async function verifyChallan(id) {
  const { data } = await api.put(`/verify/${id}`);
  return data;
}

export async function rejectChallan(id, reason = '') {
  const { data } = await api.put(`/reject/${id}`, { reason });
  return data;
}

export async function fetchEnrolledStudents(course) {
  const { data } = await api.get('/enrolled-students', {
    params: course ? { course } : {},
  });
  return data;
}

export async function fetchAdminCourses() {
  const token = localStorage.getItem('adminToken');
  const { data } = await axios.get(`${API_BASE}/api/admin/courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
