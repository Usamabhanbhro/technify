import axios from 'axios';

export const API_BASE = 'http://localhost:5000';

export function getTeacherToken() {
  return localStorage.getItem('teacherToken');
}

export function teacherAuthHeaders() {
  const token = getTeacherToken();
  return {
    Authorization: token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
  };
}

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getTeacherToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchTeacherMe() {
  const response = await api.get('/teacher/me');
  return response.data.teacher;
}

export async function fetchTeacherCourses() {
  const response = await api.get('/teacher/courses');
  return response.data.courses || [];
}

export async function fetchTeacherStudents(course = 'all') {
  const q = course && course !== 'all' ? `?course=${encodeURIComponent(course)}` : '';
  const response = await api.get(`/attendance/students${q}`);
  return response.data;
}

export async function fetchAttendanceSummary(date) {
  const response = await api.get(`/attendance/summary?date=${encodeURIComponent(date)}`);
  return response.data;
}

// QUIZ ENDPOINTS
export const createQuiz = async (quizData) => {
  const response = await api.post('/teacher/quiz', quizData);
  return response.data;
};

export const getTeacherQuizzes = async () => {
  const response = await api.get('/teacher/quiz');
  return response.data;
};

export const getQuizResults = async (quizId) => {
  const response = await api.get(`/teacher/quiz/${quizId}/results`);
  return response.data;
};

export const deleteQuiz = async (quizId) => {
  const response = await api.delete(`/teacher/quiz/${quizId}`);
  return response.data;
};