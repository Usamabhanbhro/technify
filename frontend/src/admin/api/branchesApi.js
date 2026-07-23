import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE || ''}/api/branches`;

const getAuthToken = () => localStorage.getItem('adminToken');

const authHeaders = () => ({
  Authorization: `Bearer ${getAuthToken()}`,
});

const getBranches = async () => {
  const response = await axios.get(API_URL, { headers: authHeaders() });
  return response.data;
};

const getBranchById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, { headers: authHeaders() });
  return response.data;
};

const createBranch = async (data) => {
  const response = await axios.post(API_URL, data, {
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });
  return response.data;
};

const updateBranch = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });
  return response.data;
};

const deleteBranch = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, { headers: authHeaders() });
  return response.data;
};

const getBranchStatistics = async (id) => {
  const response = await axios.get(`${API_URL}/${id}/statistics`, { headers: authHeaders() });
  return response.data;
};

const getAllBranchesStatistics = async () => {
  const response = await axios.get(`${API_URL}/statistics/all`, { headers: authHeaders() });
  return response.data;
};

const getBranchTeachers = async (branchId, { page = 1, limit = 10, search = '' } = {}) => {
  const response = await axios.get(`${API_URL}/${branchId}/teachers`, {
    headers: authHeaders(),
    params: { page, limit, search },
  });
  return response.data;
};

const getBranchStudents = async (branchId, { page = 1, limit = 10, search = '' } = {}) => {
  const response = await axios.get(`${API_URL}/${branchId}/students`, {
    headers: authHeaders(),
    params: { page, limit, search },
  });
  return response.data;
};

export {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchStatistics,
  getAllBranchesStatistics,
  getBranchTeachers,
  getBranchStudents,
};
