import axios from 'axios';

export const API_BASE = 'http://localhost:5000';

export function getStudentToken() {
  return localStorage.getItem('studentToken');
}

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getStudentToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response handler: when backend returns 401, clear token and
// redirect to the student login page to avoid repeated console errors.
api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    try {
      if (err?.response?.status === 401) {
        localStorage.removeItem('studentToken');
        // If not already on student login, redirect.
        if (!window.location.pathname.startsWith('/student/login')) {
          window.location.assign('/student/login');
        }
      }
    } catch (e) {
      // ignore
    }
    return Promise.reject(err);
  }
);

export async function fetchStudentMe() {
  const response = await api.get('/student/me');
  return response.data.student;
}

// QUIZ ENDPOINTS
export const getStudentQuizzes = async () => {
  const response = await api.get('/student/quizzes');
  return response.data;
};

export const getQuizDetails = async (quizId) => {
  const response = await api.get(`/student/quizzes/${quizId}`);
  return response.data;
};

export const submitQuiz = async (quizId, answers) => {
  const response = await api.post(`/student/quizzes/${quizId}/submit`, { answers });
  return response.data;
};

export const getPastAttempts = async () => {
  const response = await api.get('/student/quizzes/attempts');
  return response.data;
};

export const checkNewQuizzes = async () => {
  const token = getStudentToken();
  if (!token) {
    return { hasNew: false };
  }
  const response = await api.get('/student/quizzes/has-new');
  return response.data;
};