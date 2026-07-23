import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const studentQuizAPI = {
  // Get assigned quizzes for student
  getMyQuizzes: async () => {
    const response = await axios.get(`${API_BASE_URL}/student/quizzes`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('studentToken')}`,
      },
    });
    return response;
  },

  // Get quiz details for taking
  getQuizForAttempt: async (quizId) => {
    const response = await axios.get(`${API_BASE_URL}/student/quizzes/${quizId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('studentToken')}`,
      },
    });
    return response;
  },

  // Submit quiz attempt
  submitQuizAttempt: async (quizId, answers) => {
    const response = await axios.post(
      `${API_BASE_URL}/student/quiz/${quizId}/submit`,
      { answers },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('studentToken')}`,
        },
      }
    );
    return response;
  },

  // Get quiz result
  getQuizResult: async (quizId) => {
    const response = await axios.get(`${API_BASE_URL}/student/quiz/${quizId}/result`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('studentToken')}`,
      },
    });
    return response;
  },

  // Get student's past attempts
  getPastAttempts: async (quizId) => {
    const response = await axios.get(`${API_BASE_URL}/student/quizzes/${quizId}/attempts`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('studentToken')}`,
      },
    });
    return response;
  },
};

export default studentQuizAPI;
