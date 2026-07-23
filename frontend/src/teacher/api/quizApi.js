import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 1. Create a reusable axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// 2. Attach an interceptor to automatically inject the teacher token into EVERY request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teacherToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 3. Your clean, boilerplate-free API endpoints object
const quizAPI = {
  // Generate AI Quiz
  generateAIQuiz: async (quizData) => {
    return await api.post('/teacher/quiz/generate-ai', quizData);
  },

  // Create Quiz Manually
  createQuiz: async (quizData) => {
    return await api.post('/teacher/quiz/create', quizData);
  },

  // Get Teacher's Quizzes
  getTeacherQuizzes: async () => {
    return await api.get('/teacher/quiz/list');
  },

  // Get Quiz Details
  getQuizDetails: async (quizId) => {
    return await api.get(`/teacher/quiz/${quizId}/details`);
  },

  // Assign Quiz to Students
  assignQuizToStudents: async (quizId, studentIds) => {
    return await api.put(`/teacher/quiz/${quizId}/assign`, { studentIds });
  },

  // Get Quiz Results
  getQuizResults: async (quizId) => {
    return await api.get(`/teacher/quiz/${quizId}/results`);
  },

  // Get Quiz Leaderboard
  getQuizLeaderboard: async (quizId) => {
    return await api.get(`/teacher/quiz/${quizId}/leaderboard`);
  },

  // Delete Quiz
  deleteQuiz: async (quizId) => {
    return await api.delete(`/teacher/quiz/${quizId}`);
  },

  // Get Students List
  getStudentsList: async () => {
    return await api.get('/teacher/students/list');
  },
};

export default quizAPI;